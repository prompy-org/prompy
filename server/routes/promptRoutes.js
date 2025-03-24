import express from 'express';
import { 
  getPrompts, 
  getPromptById, 
  createPrompt, 
  updatePrompt, 
  deletePrompt 
} from '../controllers/promptController.js';

const router = express.Router();

// GET /api/prompts - Get all prompts for a user
router.get('/', getPrompts);

// GET /api/prompts/:id - Get a specific prompt
router.get('/:id', getPromptById);

// POST /api/prompts - Create a new prompt
router.post('/', createPrompt);

// PUT /api/prompts/:id - Update a prompt
router.put('/:id', updatePrompt);

// DELETE /api/prompts/:id - Delete a prompt
router.delete('/:id', deletePrompt);

export default router;