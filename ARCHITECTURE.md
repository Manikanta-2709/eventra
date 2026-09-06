# Eventra SaaS Architecture

Eventra is a role-based event operations platform for colleges, communities, conferences, and workshops.

## Current Technical Baseline

- Frontend: React 18, Vite, React Router, Tailwind CSS, Recharts, Axios
- Backend: Node.js, Express, Mongoose
- Database: MongoDB with indexed event discovery and organizer queries
- Media: Cloudinary uploads
- Payments: demo payments and Stripe Checkout integration
- Notifications: Nodemailer and scheduled reminders
- Security baseline: bcrypt password hashing, JWT-protected routes, role middleware, request validation

The current repository is Mongo/Mongoose based. A PostgreSQL/Prisma migration should be treated as a separate release, not mixed into feature work.

## Roles and Boundaries

- `admin`: manage users, organizer approvals, events, and platform analytics
- `organizer`: create and operate owned events after approval
- `user`: discover events, register, receive tickets, check booking history, review attended events

All organizer mutations must verify both role and ownership. Public event reads must only expose approved events in `published` or `registration_open` status.

## Event Lifecycle

```text
draft -> published -> registration_open -> registration_closed -> ongoing -> completed
  |          |              |                    |              |
  +----------+--------------+--------------------+--------------+--> cancelled
```

Terminal states are `completed` and `cancelled`. Lifecycle changes use `PUT /api/events/:id/status` and are validated server-side. Registration is accepted only for `published` and `registration_open` events.

## Data Model

### User

`name`, `email`, `passwordHash`, `role`, `isApproved`, `isBlocked`, `avatar`, reset-token fields, timestamps.

### Event

`title`, `description`, `category`, `venue`, `city`, `date`, `time`, `status`, `registrationClosed`, `maxSeats`, `availableSeats`, `ticketPrice`, `banner`, `organizer`, `isApproved`, `isFeatured`, `viewsCount`, `bookingsCount`, `averageRating`, `reviewsCount`.

Indexes:

- text index on title, description, and city
- organizer + status + date for dashboards
- status + approval + date for discovery

### Booking / Registration

`user`, `event`, `numberOfTickets`, pricing fields, `bookingStatus`, `paymentStatus`, `paymentProvider`, `paymentReference`, unique `ticketCode`, `qrCodeData`, `checkedIn`, `checkedInAt`, timestamps.

Recommended next status expansion: `pending`, `confirmed`, `waitlisted`, `cancelled`, `refunded`, `expired`.

### Planned Collections

- `Speaker`: event, name, bio, image, order
- `ScheduleItem`: event, title, start/end time, room, speaker references
- `Certificate`: booking/user/event, issue date, verification token, PDF URL
- `Review`: user, event, rating, comment, moderation status
- `Notification`: user, type, title, body, readAt, related resource
- `Organization` and `Membership`: workspace tenancy, owner, member role, invitation status
- `AuditLog`: actor, action, resource, metadata, timestamp

## API Surface

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `PUT /api/auth/reset-password/:token`

Next security release: short-lived access tokens, rotating refresh tokens in httpOnly cookies, token revocation, rate limiting, Helmet, and structured audit events.

### Events

- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `PUT /api/events/:id/status`
- `PUT /api/events/:id/publish`
- `PUT /api/events/:id/close-registration`
- `GET /api/events/organizer/mine`
- `GET /api/events/organizer/revenue`
- `GET /api/events/:id/attendees`
- `GET /api/events/:id/attendees/export`

### Registration and Attendance

- `POST /api/bookings`
- `GET /api/bookings`
- `GET /api/bookings/:id`
- `DELETE /api/bookings/:id`
- `POST /api/bookings/check-in`

Next release: atomic seat reservation, idempotency keys, waitlists, payment webhooks, and refund reconciliation.

## Frontend Structure

```text
client/src/
  api/                 Axios client and API modules
  components/          Navbar, cards, forms, tables, skeletons, feedback
  context/             Auth and theme providers
  hooks/               Reusable query and form hooks
  pages/
    public/            Landing, discovery, event detail
    auth/              Login, registration, password recovery
    attendee/          Dashboard, bookings, tickets, certificates
    organizer/         Dashboard, event wizard, attendees, scanner, reports
    admin/             Users, approvals, platform analytics, settings
  utils/               formatting, validation, ticket and report helpers
```

Recommended frontend evolution: React Query for server state, React Hook Form + Zod for wizard validation, Zustand for small client-only state, Framer Motion for route and list transitions, and Lucide icons for controls.

## Product Screens

- Public landing and discovery with featured, trending, upcoming, category, date, and city filters
- Dedicated event page with banner, schedule, speakers, venue, reviews, and registration CTA
- Organizer wizard: basics, date/venue, media, speakers/schedule, tickets, preview/publish
- Organizer operations dashboard with lifecycle status, registrations, revenue, fill rate, attendance, and reports
- Attendee dashboard with registrations, saved events, tickets, certificates, and history
- Admin dashboard with users, organizers, events, registration analytics, activity, and settings
- Notification center and profile/security settings

## Delivery Roadmap

1. **Foundation:** lifecycle state machine, API validation, ownership checks, indexed discovery, dashboard metrics. Completed in the current release.
2. **Registration integrity:** atomic seat updates, waitlist promotion, registration deadlines, idempotent booking requests, Stripe webhooks.
3. **Wizard and media:** multi-step event creation, Zod validation, speaker/schedule models, Cloudinary media collections, preview publishing.
4. **Operations:** attendance dashboard, QR scanner hardening, downloadable ticket PDF, event CSV/PDF reports.
5. **Engagement:** notifications, reviews/feedback insights, event updates, reminders, certificates with QR verification.
6. **SaaS hardening:** organizations/workspaces, memberships, refresh-token rotation, rate limiting, audit logs, observability, automated tests, and deployment checks.

## Portfolio Acceptance Criteria

- Every protected mutation has server-side role and ownership checks.
- Public discovery never returns drafts or cancelled events.
- Booking cannot oversell capacity under concurrent requests.
- Every successful registration has a verifiable ticket and QR payload.
- Organizer dashboards show registration, attendance, fill rate, and revenue metrics.
- Certificates and reports are generated from persisted attendance data.
- Mobile layout, loading, empty, error, and unauthorized states are covered.
- API, model, and critical workflow tests run in CI before deployment.
