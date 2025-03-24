import Prompt from '../models/promptModel.js';
import * as process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

// Test data for local development
const testPrompts = [
  {
    _id: '1',
    title: 'Code Review',
    content: 'Please review this code and suggest improvements...',
    userId: 'test-user-1',
    tags: ['code', 'review'],
    createdAt: '2023-01-01T12:00:00Z',
    updatedAt: '2023-01-01T12:00:00Z'
  },
  {
    _id: '2',
    title: 'Blog Post Ideas',
    content: 'Generate 5 blog post ideas about React development...',
    userId: 'test-user-1',
    tags: ['blog', 'ideas', 'react'],
    createdAt: '2023-01-02T12:00:00Z',
    updatedAt: '2023-01-02T12:00:00Z'
  }
];

// Use test data if DB is not connected (for local testing)
const useTestData = process.env.USE_TEST_DATA === 'true';

// GET all prompts for a user
export const getPrompts = async (req, res) => {
  try {
    // In a real app, you'd get the userId from auth middleware
    const userId = req.query.userId || 'test-user-1';
    
    if (useTestData) {
      return res.status(200).json(testPrompts.filter(p => p.userId === userId));
    }
    
    const prompts = await Prompt.find({ userId }).sort({ updatedAt: -1 });
    res.status(200).json(prompts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompts', error: error.message });
  }
};

// GET a prompt by ID
export const getPromptById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useTestData) {
      const prompt = testPrompts.find(p => p._id === id);
      if (!prompt) return res.status(404).json({ message: 'Prompt not found' });
      return res.status(200).json(prompt);
    }
    
    const prompt = await Prompt.findById(id);
    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });
    
    res.status(200).json(prompt);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompt', error: error.message });
  }
};

// CREATE a new prompt
export const createPrompt = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    // In a real app, you'd get the userId from auth middleware
    const userId = req.body.userId || 'test-user-1';
    
    if (useTestData) {
      const newPrompt = {
        _id: Date.now().toString(),
        title,
        content,
        userId,
        tags: tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      testPrompts.push(newPrompt);
      return res.status(201).json(newPrompt);
    }
    
    const newPrompt = await Prompt.create({
      title,
      content,
      userId,
      tags: tags || []
    });
    
    res.status(201).json(newPrompt);
  } catch (error) {
    res.status(400).json({ message: 'Error creating prompt', error: error.message });
  }
};

// UPDATE a prompt
export const updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    
    if (useTestData) {
      const promptIndex = testPrompts.findIndex(p => p._id === id);
      if (promptIndex === -1) return res.status(404).json({ message: 'Prompt not found' });
      
      testPrompts[promptIndex] = {
        ...testPrompts[promptIndex],
        title: title || testPrompts[promptIndex].title,
        content: content || testPrompts[promptIndex].content,
        tags: tags || testPrompts[promptIndex].tags,
        updatedAt: new Date().toISOString()
      };
      
      return res.status(200).json(testPrompts[promptIndex]);
    }
    
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      id,
      { title, content, tags },
      { new: true, runValidators: true }
    );
    
    if (!updatedPrompt) return res.status(404).json({ message: 'Prompt not found' });
    
    res.status(200).json(updatedPrompt);
  } catch (error) {
    res.status(400).json({ message: 'Error updating prompt', error: error.message });
  }
};

// DELETE a prompt
export const deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useTestData) {
      const promptIndex = testPrompts.findIndex(p => p._id === id);
      if (promptIndex === -1) return res.status(404).json({ message: 'Prompt not found' });
      
      testPrompts.splice(promptIndex, 1);
      return res.status(200).json({ message: 'Prompt deleted successfully' });
    }
    
    const deletedPrompt = await Prompt.findByIdAndDelete(id);
    
    if (!deletedPrompt) return res.status(404).json({ message: 'Prompt not found' });
    
    res.status(200).json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prompt', error: error.message });
  }
};