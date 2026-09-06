const express = require('express');
const { body } = require('express-validator');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  closeRegistration,
  getMyEvents,
  getEventAttendees,
  exportEventAttendees,
  getOrganizerRevenue,
  createOrUpdateReview,
  duplicateEvent,
  publishEvent,
  updateEventStatus,
  getOrganizerProfile,
  sendAnnouncement,
  joinWaitlist,
  getWaitlist,
} = require('../controllers/eventController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const requireApprovedOrganizer = require('../middleware/approvedOrganizer');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');

const router = express.Router();

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('date').isISO8601().toDate().withMessage('Valid event date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('ticketPrice').optional().isFloat({ min: 0 }).withMessage('Ticket price must be 0 or more'),
  body('maxSeats').optional().isInt({ min: 1 }).withMessage('Maximum seats must be at least 1'),
];

// organizer-specific routes must be defined before the /:id catch-all
router.get('/organizer/mine', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/organizer/revenue', protect, authorize('organizer', 'admin'), getOrganizerRevenue);
router.get('/organizers/:organizerId', getOrganizerProfile);

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post(
  '/:id/reviews',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional({ checkFalsy: true }).trim().isLength({ max: 600 }).withMessage('Review is too long'),
  ],
  validate,
  createOrUpdateReview
);

router.post(
  '/',
  protect,
  authorize('organizer', 'admin'),
  requireApprovedOrganizer,
  upload.single('banner'),
  eventValidation,
  validate,
  createEvent
);
router.put(
  '/:id',
  protect,
  authorize('organizer', 'admin'),
  requireApprovedOrganizer,
  upload.single('banner'),
  updateEvent
);
router.delete('/:id', protect, authorize('organizer', 'admin'), requireApprovedOrganizer, deleteEvent);

router.put(
  '/:id/close-registration',
  protect,
  authorize('organizer', 'admin'),
  requireApprovedOrganizer,
  closeRegistration
);
router.post('/:id/duplicate', protect, authorize('organizer', 'admin'), requireApprovedOrganizer, duplicateEvent);
router.put('/:id/publish', protect, authorize('organizer', 'admin'), requireApprovedOrganizer, publishEvent);
router.put('/:id/status', protect, authorize('organizer', 'admin'), requireApprovedOrganizer, updateEventStatus);
router.get('/:id/attendees/export', protect, authorize('organizer', 'admin'), exportEventAttendees);
router.get('/:id/attendees', protect, authorize('organizer', 'admin'), getEventAttendees);
router.post(
  '/:id/announcements',
  protect,
  authorize('organizer', 'admin'),
  requireApprovedOrganizer,
  [
    body('title').trim().notEmpty().withMessage('Announcement title is required'),
    body('message').trim().notEmpty().withMessage('Announcement message is required'),
  ],
  validate,
  sendAnnouncement
);
router.post('/:id/waitlist', protect, joinWaitlist);
router.get('/:id/waitlist', protect, authorize('organizer', 'admin'), getWaitlist);

module.exports = router;
