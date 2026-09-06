import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const categories = ['Music', 'Tech', 'Sports', 'Business', 'Arts', 'Food', 'Education', 'Other'];

const emptyForm = {
  title: '',
  description: '',
  category: 'Music',
  venue: '',
  city: '',
  date: '',
  time: '',
  ticketPrice: 0,
  maxSeats: 50,
  status: 'published',
};

const defaultTier = { name: 'General', price: 0, capacity: 50, description: 'Standard admission pass' };

const EventForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  // Advanced features state
  const [useTiers, setUseTiers] = useState(false);
  const [tiers, setTiers] = useState([defaultTier]);
  const [customQuestions, setCustomQuestions] = useState([]);

  useEffect(() => {
    if (isEdit) {
      api.get(`/events/${id}`).then((res) => {
        const ev = res.data.event;
        setForm({
          title: ev.title,
          description: ev.description,
          category: ev.category,
          venue: ev.venue,
          city: ev.city,
          date: ev.date ? ev.date.slice(0, 10) : '',
          time: ev.time,
          ticketPrice: ev.ticketPrice,
          maxSeats: ev.maxSeats,
          status: ev.status || 'published',
        });

        if (ev.ticketTiers && ev.ticketTiers.length > 0) {
          setUseTiers(true);
          setTiers(ev.ticketTiers);
        }

        if (ev.customQuestions && ev.customQuestions.length > 0) {
          setCustomQuestions(ev.customQuestions);
        }
      });
    }
  }, [id, isEdit]);

  // Tier operations
  const addTier = () => {
    setTiers([...tiers, { name: '', price: 0, capacity: 25, description: '' }]);
  };

  const updateTier = (index, field, value) => {
    const updated = [...tiers];
    updated[index][field] = field === 'price' || field === 'capacity' ? Number(value) : value;
    setTiers(updated);
  };

  const removeTier = (index) => {
    if (tiers.length <= 1) {
      toast.info('At least one tier is required when tiered ticketing is enabled');
      return;
    }
    setTiers(tiers.filter((_, i) => i !== index));
  };

  // Custom questions operations
  const addQuestion = () => {
    setCustomQuestions([...customQuestions, { question: '', required: false }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...customQuestions];
    updated[index][field] = value;
    setCustomQuestions(updated);
  };

  const removeQuestion = (index) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (banner) data.append('banner', banner);

      if (useTiers) {
        // Validate tier names
        for (const t of tiers) {
          if (!t.name.trim()) {
            toast.error('All ticket tiers must have a name');
            setLoading(false);
            return;
          }
        }
        data.append('ticketTiers', JSON.stringify(tiers));
      } else {
        data.append('ticketTiers', JSON.stringify([]));
      }

      // Filter valid custom questions
      const validQuestions = customQuestions.filter((q) => q.question.trim());
      data.append('customQuestions', JSON.stringify(validQuestions));

      if (isEdit) {
        await api.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Event updated successfully');
      } else {
        await api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Event created successfully');
      }
      navigate('/dashboard/organizer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'organizer' && !user.isApproved) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-6 py-5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          <h1 className="text-2xl font-bold mb-2">Approval pending</h1>
          <p>Your organizer account must be approved by an admin before you can create or edit events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
        {isEdit ? 'Edit Event' : 'Create Event'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Event Details</h2>
          <input
            required
            placeholder="Event title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
          />
          <textarea
            required
            placeholder="Description of the event"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="dark:bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
            <input
              required
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
            />
          </div>
          <input
            required
            placeholder="Venue address or online meeting link"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
            />
            <input
              required
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Ticketing & Tiers */}
        <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tickets & Pricing</h2>
              <p className="text-xs text-slate-500">Configure ticket passes, prices, and attendee capacities</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400">
              <input
                type="checkbox"
                checked={useTiers}
                onChange={(e) => setUseTiers(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              Enable Multi-Tier Ticketing
            </label>
          </div>

          {!useTiers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Ticket Price (₹)</label>
                <input
                  required
                  type="number"
                  min={0}
                  placeholder="0 for free"
                  value={form.ticketPrice}
                  onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Total Capacity (Seats)</label>
                <input
                  required
                  type="number"
                  min={1}
                  placeholder="50"
                  value={form.maxSeats}
                  onChange={(e) => setForm({ ...form, maxSeats: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {tiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-700/80 p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Tier #{idx + 1}
                    </span>
                    {tiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTier(idx)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      required
                      placeholder="Tier Name (e.g. VIP, Early Bird)"
                      value={tier.name}
                      onChange={(e) => updateTier(idx, 'name', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                    <input
                      required
                      type="number"
                      min={0}
                      placeholder="Price (₹)"
                      value={tier.price}
                      onChange={(e) => updateTier(idx, 'price', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                    <input
                      required
                      type="number"
                      min={1}
                      placeholder="Capacity"
                      value={tier.capacity}
                      onChange={(e) => updateTier(idx, 'capacity', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                  <input
                    placeholder="Perks description (e.g. Reserved front seat, swag bag)"
                    value={tier.description}
                    onChange={(e) => updateTier(idx, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addTier}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                + Add Another Ticket Tier
              </button>
            </div>
          )}
        </div>

        {/* Custom Registration Questions */}
        <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Custom Registration Questions
              </h2>
              <p className="text-xs text-slate-500">
                Collect additional details during ticket checkout (e.g. T-Shirt Size, College/Company)
              </p>
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              + Add Question
            </button>
          </div>

          {customQuestions.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No custom questions added yet.</p>
          ) : (
            <div className="space-y-3">
              {customQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700/80 p-3 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <input
                    required
                    placeholder="Question prompt (e.g. T-Shirt Size or Dietary Restrictions)"
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                  />
                  <label className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(idx, 'required', e.target.checked)}
                      className="h-3.5 w-3.5 rounded text-primary-600"
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banner & Publishing */}
        <div className="space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Publish Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
              >
                <option value="draft" className="dark:bg-slate-900">Draft</option>
                <option value="published" className="dark:bg-slate-900">Published</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Event Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBanner(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold shadow-md hover:bg-primary-700 disabled:opacity-60 transition"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default EventForm;
