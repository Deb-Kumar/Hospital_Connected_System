const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, default: 'General Health', trim: true },
  desc: { type: String, required: true },
  author: { type: String, default: 'Brainware Medical Faculty' },
  role: { type: String, default: 'Clinical Specialist' },
  readTime: { type: String, default: '5 min read' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600' },
  fullText: { type: String, required: true },
  status: { type: String, default: 'PENDING' },
  rejectionReason: { type: String, default: '' },
  authorUserId: { type: String, default: '' },
  showOnHome: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
