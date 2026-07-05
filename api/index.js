const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection URI
const MONGO_URI = 'mongodb+srv://gunaknn_db_user:gunasekarviji@cluster0.ioiwshu.mongodb.net/swiftmarket?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
// User schema matching collection "Kaalachuvadu-users"
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  avatar: { type: String },
  birthday: { type: String }
}, { collection: 'Kaalachuvadu-users', timestamps: true });

const User = mongoose.model('User', UserSchema);

// Event schema matching user events
const EventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userEmail: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  allDay: { type: Boolean, default: true },
  category: { type: String, default: 'personal' },
  color: { type: String },
  location: { type: String }
}, { collection: 'Kaalachuvadu-events', timestamps: true });

const Event = mongoose.model('Event', EventSchema);

// API Endpoints
// 1. Get or create user (Google Sign-In callback sync)
app.post('/api/users', async (req, res) => {
  const { email, name, avatar, birthday } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, avatar, birthday });
      await user.save();
    } else {
      // Update fields if changed
      user.name = name || user.name;
      user.avatar = avatar || user.avatar;
      // Only update birthday if it was not already set, or if a new valid birthday is provided
      if (birthday && (!user.birthday || birthday !== user.birthday)) {
        user.birthday = birthday;
      }
      await user.save();
    }
    res.json(user);
  } catch (err) {
    console.error('Error in /api/users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Fetch all events for a user
app.get('/api/events', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const events = await Event.find({ userEmail: email });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Batch sync local storage events to MongoDB on first login
app.post('/api/events/sync', async (req, res) => {
  const { email, events } = req.body;
  if (!email || !events) {
    return res.status(400).json({ error: 'Email and events are required' });
  }

  try {
    const operations = events.map(event => ({
      updateOne: {
        filter: { id: event.id },
        update: { ...event, userEmail: email },
        upsert: true
      }
    }));
    if (operations.length > 0) {
      await Event.bulkWrite(operations);
    }
    const updatedEvents = await Event.find({ userEmail: email });
    res.json(updatedEvents);
  } catch (err) {
    console.error('Error syncing events:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Create an event
app.post('/api/events', async (req, res) => {
  const { email, event } = req.body;
  if (!email || !event) {
    return res.status(400).json({ error: 'Email and event are required' });
  }

  try {
    const newEvent = new Event({
      ...event,
      userEmail: email
    });
    await newEvent.save();
    res.json(newEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. Update an event
app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { email, event } = req.body;

  try {
    const updated = await Event.findOneAndUpdate(
      { id, userEmail: email },
      { $set: event },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 6. Delete an event
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.query;

  try {
    await Event.findOneAndDelete({ id, userEmail: email });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start local server if run directly (Vercel routes requests directly to app handler)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
