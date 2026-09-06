const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Music', 'Tech', 'Sports', 'Business', 'Arts', 'Food', 'Education', 'Other'],
    },
    venue: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    ticketPrice: { type: Number, required: true, min: 0 },
    maxSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true },
    banner: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
    registrationClosed: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 0 },
    bookingsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    ticketTiers: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        capacity: { type: Number, required: true, min: 1 },
        soldCount: { type: Number, default: 0 },
        description: { type: String, default: '' },
      },
    ],
    customQuestions: [
      {
        question: { type: String, required: true },
        required: { type: Boolean, default: false },
        options: [{ type: String }],
      },
    ],
    announcements: [
      {
        title: { type: String, required: true },
        message: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', city: 'text' });
eventSchema.index({ organizer: 1, status: 1, date: 1 });
eventSchema.index({ status: 1, isApproved: 1, date: 1 });

module.exports = mongoose.model('Event', eventSchema);
