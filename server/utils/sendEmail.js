const nodemailer = require('nodemailer');
const { Resend } = require('resend');

let etherealTransporter = null;

/**
 * Get or initialize a shared Ethereal test account transporter
 */
const getEtherealTransporter = async () => {
  if (etherealTransporter) return etherealTransporter;

  try {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Ethereal Email] Initialized free test account: ${testAccount.user}`);
    return etherealTransporter;
  } catch (err) {
    console.error('[Ethereal Email] Failed to create test account:', err.message);
    return null;
  }
};

/**
 * Send an email via Resend API, SMTP, or auto Ethereal preview
 *
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} [options.backupEmail] - Optional secondary backup recipient
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML email body
 * @param {Array} [options.attachments] - Inline attachments (QR codes, PDFs)
 * @returns {Promise<Object>} Delivery result details
 */
const sendEmail = async ({ to, backupEmail, subject, html, attachments = [] }) => {
  const fromAddress = process.env.EMAIL_FROM || 'Eventra <onboarding@resend.dev>';

  // Consolidate primary and backup recipients
  const recipients = Array.isArray(to) ? [...to] : [to];
  if (backupEmail && typeof backupEmail === 'string' && backupEmail.trim() && !recipients.includes(backupEmail.trim())) {
    recipients.push(backupEmail.trim());
  }

  const cleanRecipients = recipients.filter((r) => typeof r === 'string' && r.includes('@'));
  if (cleanRecipients.length === 0) {
    console.warn('[sendEmail] No valid recipient email provided.');
    return { success: false, message: 'No valid recipient' };
  }

  // 1. If RESEND_API_KEY is configured, send via Resend REST API (free 3,000 emails/mo)
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_resend_api_key') {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Map attachments for Resend if provided
      const resendAttachments = attachments.map((att) => ({
        filename: att.filename || 'attachment.png',
        content: att.content, // buffer or base64
      }));

      const data = await resend.emails.send({
        from: fromAddress,
        to: cleanRecipients,
        subject,
        html,
        attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
      });

      if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
      }

      console.log(`[Resend API] Email sent to ${cleanRecipients.join(', ')} (ID: ${data.data?.id || 'delivered'})`);
      return { success: true, provider: 'resend', id: data.data?.id, recipients: cleanRecipients };
    } catch (err) {
      console.warn(`[Resend API Error] ${err.message}. Falling back to secondary transport.`);
    }
  }

  // 2. If SMTP is explicitly configured and not placeholder, send via standard SMTP
  const hasValidSmtp =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_USER !== 'your_email@gmail.com' &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== 'your_app_password';

  if (hasValidSmtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"Eventra" <${process.env.SMTP_USER}>`,
        to: cleanRecipients.join(', '),
        subject,
        html,
        attachments,
      });

      console.log(`[SMTP] Email sent to ${cleanRecipients.join(', ')} (MessageId: ${info.messageId})`);
      return { success: true, provider: 'smtp', messageId: info.messageId, recipients: cleanRecipients };
    } catch (err) {
      console.warn(`[SMTP Error] ${err.message}. Falling back to Ethereal Email preview.`);
    }
  }

  // 3. Free automatic Ethereal Email test preview (Zero setup, instant browser preview URL)
  try {
    const transporter = await getEtherealTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"Eventra Preview" <no-reply@eventra.local>`,
        to: cleanRecipients.join(', '),
        subject,
        html,
        attachments,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('\n---------------------------------------------------------');
      console.log(`📧 [Ethereal Email Preview] Delivered to: ${cleanRecipients.join(', ')}`);
      console.log(`📌 Subject: "${subject}"`);
      console.log(`🔗 Click to view rendered email with QR in browser:\n   ${previewUrl}`);
      console.log('---------------------------------------------------------\n');

      return { success: true, provider: 'ethereal', previewUrl, recipients: cleanRecipients };
    }
  } catch (err) {
    console.error(`[Ethereal Email Error] ${err.message}`);
  }

  // Fallback log if all transports fail
  console.log(`[Email Mock Console] Sent "${subject}" to ${cleanRecipients.join(', ')}`);
  return { success: true, provider: 'mock', recipients: cleanRecipients };
};

module.exports = sendEmail;
