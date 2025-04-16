import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const Prompt = mongoose.model('Prompt', promptSchema);

export default Prompt;