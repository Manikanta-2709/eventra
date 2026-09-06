const crypto = require('crypto');
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Coupon = require('../models/Coupon');
const Waitlist = require('../models/Waitlist');
const sendEmail = require('../utils/sendEmail');

const calculateDiscount = async (couponCode, subtotal) => {
  if (!couponCode) return { discountCode: undefined, discountAmount: 0 };

  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
  if (!coupon) {
    const err = new Error('Invalid coupon code');
    err.statusCode = 400;
    throw err;
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    const err = new Error('Coupon has expired');
    err.statusCode = 400;
    throw err;
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    const err = new Error('Coupon usage limit reached');
    err.statusCode = 400;
    throw err;
  }

  if (subtotal < coupon.minOrderValue) {
    const err = new Error(`Coupon requires minimum order value of ₹${coupon.minOrderValue}`);
    err.statusCode = 400;
    throw err;
  }

  const rawDiscount =
    coupon.discountType === 'percentage' ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
  const cappedDiscount = coupon.maxDiscount > 0 ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
  const discountAmount = Math.min(subtotal, Math.round(cappedDiscount));

  coupon.usedCount += 1;
  await coupon.save();

  return { discountCode: coupon.code, discountAmount };
};

const generateQRCode = async (ticketCode, title) => {
  try {
    return await QRCode.toDataURL(`EVENTRA|${ticketCode}|${title}`);
  } catch (error) {
    console.warn(`QR code generation failed: ${error.message}`);
    return '';
  }
};

const buildTicketEmailHtml = ({ booking, event, user, finalTierName, qrCodeData }) => {
  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #1e40af, #4338ca, #6d28d9); padding: 32px 24px; text-align: center; color: #ffffff;">
        <span style="background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
          Official Event Pass
        </span>
        <h1 style="margin: 14px 0 6px; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
          ${event?.title || 'Event Booking'}
        </h1>
        <p style="margin: 0; font-size: 13px; color: #c7d2fe;">
          Confirmed for ${user?.name || 'Attendee'}
        </p>
      </div>

      <!-- Scannable QR Code Section -->
      <div style="padding: 28px 24px; text-align: center; background: #f8fafc; border-bottom: 2px dashed #cbd5e1;">
        <p style="margin: 0 0 12px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">
          Scan for Instant Venue Entry
        </p>
        <div style="display: inline-block; padding: 12px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <img src="cid:ticket_qr_code" alt="Ticket QR Code" style="width: 170px; height: 170px; display: block; margin: 0 auto;" />
        </div>
        <div style="margin-top: 14px;">
          <span style="font-family: monospace; font-size: 16px; font-weight: 800; letter-spacing: 3px; color: #1e293b; background: #ffffff; padding: 6px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
            ${booking.ticketCode}
          </span>
        </div>
        <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8;">
          Present this QR code on your mobile phone upon arrival at the venue.
        </p>
      </div>

      <!-- Event Details -->
      <div style="padding: 24px 28px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-size: 12px; color: #64748b; font-weight: bold;">Date & Time</td>
            <td style="padding: 8px 0; font-size: 13px; color: #0f172a; font-weight: 600; text-align: right;">${formattedDate} at ${event?.time || 'TBD'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 12px; color: #64748b; font-weight: bold;">Venue</td>
            <td style="padding: 8px 0; font-size: 13px; color: #0f172a; font-weight: 600; text-align: right;">${event?.venue || 'TBD'}, ${event?.city || ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 12px; color: #64748b; font-weight: bold;">Ticket Tier</td>
            <td style="padding: 8px 0; font-size: 13px; color: #2563eb; font-weight: 700; text-align: right;">${finalTierName || booking.tierName || 'General Admission'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 12px; color: #64748b; font-weight: bold;">Quantity</td>
            <td style="padding: 8px 0; font-size: 13px; color: #0f172a; font-weight: 600; text-align: right;">${booking.numberOfTickets} Ticket(s)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 12px; color: #64748b; font-weight: bold;">Total Amount</td>
            <td style="padding: 8px 0; font-size: 14px; color: #059669; font-weight: 800; text-align: right;">₹${booking.totalPrice}</td>
          </tr>
          ${booking.backupEmail ? `
          <tr>
            <td style="padding: 8px 0; font-size: 12px; color: #64748b; font-weight: bold;">Backup Email</td>
            <td style="padding: 8px 0; font-size: 12px; color: #475569; font-weight: 500; text-align: right;">${booking.backupEmail}</td>
          </tr>
          ` : ''}
        </table>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="margin: 0 0 6px; font-size: 11px; color: #94a3b8;">
            You can view, download, or sync this pass anytime from your Eventra Bookings dashboard.
          </p>
        </div>
      </div>
    </div>
  `;
};

// @route POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const {
      eventId,
      numberOfTickets,
      couponCode,
      paymentProvider = 'demo',
      paymentReference,
      tierName,
      customAnswers,
      backupEmail,
    } = req.body;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (!['published', 'registration_open'].includes(event.status) || event.registrationClosed) {
      return res.status(400).json({ success: false, message: 'Registration is closed for this event' });
    }
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ success: false, message: 'This event has already occurred' });
    }
    if (event.availableSeats < numberOfTickets) {
      return res.status(400).json({ success: false, message: 'Not enough seats available' });
    }

    let selectedTier = null;
    let unitPrice = event.ticketPrice;
    let finalTierName = tierName || 'General';

    if (event.ticketTiers && event.ticketTiers.length > 0) {
      if (tierName) {
        selectedTier = event.ticketTiers.find((t) => t.name.toLowerCase() === tierName.toLowerCase());
      } else {
        selectedTier = event.ticketTiers[0];
      }

      if (!selectedTier) {
        return res.status(400).json({ success: false, message: `Ticket tier '${tierName}' not found` });
      }

      const tierAvailable = selectedTier.capacity - (selectedTier.soldCount || 0);
      if (tierAvailable < numberOfTickets) {
        return res.status(400).json({
          success: false,
          message: `Only ${tierAvailable} ticket(s) left in the ${selectedTier.name} tier`,
        });
      }

      unitPrice = selectedTier.price;
      finalTierName = selectedTier.name;
    }

    // Validate required custom registration questions
    if (event.customQuestions && event.customQuestions.length > 0) {
      const answersList = Array.isArray(customAnswers) ? customAnswers : [];
      const ansMap = new Map(answersList.map((a) => [a.question, a.answer]));
      for (const q of event.customQuestions) {
        if (q.required && (!ansMap.get(q.question) || !ansMap.get(q.question).trim())) {
          return res.status(400).json({
            success: false,
            message: `Please provide an answer for: "${q.question}"`,
          });
        }
      }
    }

    const subtotal = unitPrice * numberOfTickets;
    const { discountCode, discountAmount } = await calculateDiscount(couponCode, subtotal);
    const totalPrice = Math.max(0, subtotal - discountAmount);
    const finalPaymentReference = paymentReference || `${paymentProvider.toUpperCase()}-${Date.now()}`;

    const booking = await Booking.create({
      user: req.user._id,
      event: event._id,
      numberOfTickets,
      tierName: finalTierName,
      tierPrice: unitPrice,
      customAnswers: Array.isArray(customAnswers) ? customAnswers : [],
      backupEmail: backupEmail ? String(backupEmail).trim().toLowerCase() : undefined,
      subtotal,
      discountCode,
      discountAmount,
      totalPrice,
      paymentProvider,
      paymentReference: finalPaymentReference,
    });

    const qrCodeData = await generateQRCode(booking.ticketCode, event.title);
    booking.qrCodeData = qrCodeData;
    await booking.save();

    event.availableSeats = Math.max(0, event.availableSeats - numberOfTickets);
    event.bookingsCount += 1;
    if (selectedTier) {
      selectedTier.soldCount = (selectedTier.soldCount || 0) + numberOfTickets;
    }
    await event.save();

    // Mark user converted on waitlist if present
    await Waitlist.updateMany({ event: event._id, user: req.user._id }, { status: 'converted' });

    const populated = await booking.populate('event', 'title date time venue city banner');

    try {
      const qrBase64 = (qrCodeData || '').replace(/^data:image\/png;base64,/, '');
      const attachments = qrBase64
        ? [
            {
              filename: `ticket-${booking.ticketCode}.png`,
              content: qrBase64,
              encoding: 'base64',
              cid: 'ticket_qr_code',
            },
          ]
        : [];

      await sendEmail({
        to: req.user.email,
        backupEmail: booking.backupEmail,
        subject: `Booking Confirmed: ${event.title} [${booking.ticketCode}]`,
        html: buildTicketEmailHtml({
          booking,
          event,
          user: req.user,
          finalTierName,
          qrCodeData,
        }),
        attachments,
      });
    } catch (emailErr) {
      console.warn(`Booking confirmation email failed for ${booking._id}: ${emailErr.message}`);
    }

    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/bookings/check-in
exports.checkInBooking = async (req, res, next) => {
  try {
    const ticketCode = String(req.body.ticketCode || '').trim().toUpperCase();
    const booking = await Booking.findOne({ ticketCode }).populate('event').populate('user', 'name email phone');

    if (!booking) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (booking.bookingStatus !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Ticket is not active' });
    }

    const isOwner = booking.event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to check in this ticket' });
    }

    if (booking.checkedIn) {
      return res.status(400).json({ success: false, message: 'Ticket already checked in', booking });
    }

    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    if (!booking.certificateId) {
      booking.certificateId = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      booking.certificateIssuedAt = new Date();
    }
    await booking.save();

    res.json({ success: true, message: 'Check-in successful', booking });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/bookings (current user's booking history)
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date time venue city banner ticketPrice ticketTiers organizer')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event').populate('user', 'name email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isOwner = booking.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/bookings/:id (cancel booking)
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    const event = await Event.findById(booking.event);
    if (event) {
      event.availableSeats += booking.numberOfTickets;
      event.bookingsCount = Math.max(0, event.bookingsCount - 1);

      if (event.ticketTiers && event.ticketTiers.length > 0 && booking.tierName) {
        const tier = event.ticketTiers.find((t) => t.name.toLowerCase() === booking.tierName.toLowerCase());
        if (tier) {
          tier.soldCount = Math.max(0, (tier.soldCount || 0) - booking.numberOfTickets);
        }
      }
      await event.save();

      // Check waitlist for this event and notify next in queue
      const nextWaiting = await Waitlist.findOne({ event: event._id, status: 'waiting' }).populate('user', 'name email');
      if (nextWaiting && nextWaiting.user?.email) {
        nextWaiting.status = 'notified';
        nextWaiting.notifiedAt = new Date();
        await nextWaiting.save();

        sendEmail({
          to: nextWaiting.user.email,
          subject: `Ticket available for ${event.title}!`,
          html: `
            <h2>Ticket spot opened up!</h2>
            <p>Hi ${nextWaiting.user.name},</p>
            <p>A ticket spot has just become available for <strong>${event.title}</strong>.</p>
            <p>Head to Eventra now to claim your ticket before it is taken!</p>
          `,
        }).catch((e) => console.warn(`Waitlist notification failed: ${e.message}`));
      }
    }

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/bookings/:id/toggle-check-in (organizer/admin manual toggle from table)
exports.toggleCheckIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event').populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isOwner = booking.event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify check-in status' });
    }

    booking.checkedIn = !booking.checkedIn;
    booking.checkedInAt = booking.checkedIn ? new Date() : null;

    if (booking.checkedIn && !booking.certificateId) {
      booking.certificateId = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      booking.certificateIssuedAt = new Date();
    }
    await booking.save();

    res.json({
      success: true,
      message: booking.checkedIn ? 'Attendee checked in successfully' : 'Check-in reverted',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/bookings/:id/certificate (verified attendance certificate)
exports.getCertificate = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!booking.checkedIn) {
      return res.status(400).json({
        success: false,
        message: 'Certificate is only available once attendance has been verified (checked in).',
      });
    }

    if (!booking.certificateId) {
      booking.certificateId = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      booking.certificateIssuedAt = new Date();
      await booking.save();
    }

    const User = require('../models/User');
    const organizer = await User.findById(booking.event.organizer).select('name email');

    res.json({
      success: true,
      certificate: {
        certificateId: booking.certificateId,
        issuedAt: booking.certificateIssuedAt || booking.checkedInAt || new Date(),
        attendeeName: booking.user?.name || 'Attendee',
        attendeeEmail: booking.user?.email || '',
        eventTitle: booking.event?.title,
        eventDate: booking.event?.date,
        eventTime: booking.event?.time,
        eventVenue: `${booking.event?.venue}, ${booking.event?.city}`,
        organizerName: organizer?.name || 'Event Organizer',
        tierName: booking.tierName || 'General',
        ticketCode: booking.ticketCode,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/bookings/:id/resend-email
exports.resendBookingEmail = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership or organizer/admin
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isStaff = ['organizer', 'admin'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { backupEmail } = req.body;
    if (backupEmail && typeof backupEmail === 'string' && backupEmail.trim()) {
      booking.backupEmail = backupEmail.trim().toLowerCase();
      await booking.save();
    }

    // Ensure QR code is present
    if (!booking.qrCodeData) {
      booking.qrCodeData = await generateQRCode(booking.ticketCode, booking.event?.title || 'Event');
      await booking.save();
    }

    const qrBase64 = (booking.qrCodeData || '').replace(/^data:image\/png;base64,/, '');
    const attachments = qrBase64
      ? [
          {
            filename: `ticket-${booking.ticketCode}.png`,
            content: qrBase64,
            encoding: 'base64',
            cid: 'ticket_qr_code',
          },
        ]
      : [];

    const effectiveBackup = backupEmail ? backupEmail.trim().toLowerCase() : booking.backupEmail;
    const emailResult = await sendEmail({
      to: booking.user.email,
      backupEmail: effectiveBackup,
      subject: `Ticket Pass & QR: ${booking.event?.title || 'Your Event Booking'} [${booking.ticketCode}]`,
      html: buildTicketEmailHtml({
        booking,
        event: booking.event,
        user: booking.user,
        finalTierName: booking.tierName,
        qrCodeData: booking.qrCodeData,
      }),
      attachments,
    });

    const targetList = [booking.user.email, effectiveBackup].filter(Boolean).join(' and ');

    res.status(200).json({
      success: true,
      message: `Ticket pass with QR code sent to ${targetList}`,
      emailResult,
      backupEmail: booking.backupEmail,
    });
  } catch (err) {
    next(err);
  }
};

