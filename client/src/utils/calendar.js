// Utility to generate Google Calendar URLs and downloadable .ics files

const formatDateToICS = (dateObj) => {
  const pad = (n) => String(n).padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  const month = pad(dateObj.getUTCMonth() + 1);
  const day = pad(dateObj.getUTCDate());
  const hours = pad(dateObj.getUTCHours());
  const minutes = pad(dateObj.getUTCMinutes());
  const seconds = pad(dateObj.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

export const getGoogleCalendarUrl = (event) => {
  if (!event || !event.date) return '#';
  try {
    const startDate = new Date(event.date);
    // Add 2 hours default duration if not specified
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const startStr = formatDateToICS(startDate);
    const endStr = formatDateToICS(endDate);

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title || 'Event',
      dates: `${startStr}/${endStr}`,
      details: `${event.description || ''}\n\nVenue: ${event.venue || ''}, ${event.city || ''}`,
      location: `${event.venue || ''}, ${event.city || ''}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (err) {
    console.error('Failed to create Google Calendar URL', err);
    return '#';
  }
};

export const downloadICSFile = (event) => {
  if (!event || !event.date) return;
  try {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const startStr = formatDateToICS(startDate);
    const endStr = formatDateToICS(endDate);
    const nowStr = formatDateToICS(new Date());

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Eventra//Event Management Portal//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:eventra-${event._id || Date.now()}@eventra.local`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${(event.title || 'Event').replace(/\n/g, ' ')}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, ' ')}`,
      `LOCATION:${`${event.venue || ''}, ${event.city || ''}`.replace(/\n/g, ' ')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(event.title || 'event').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to generate .ics file', err);
  }
};
