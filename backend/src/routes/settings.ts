import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';

const router = Router();

// Get user settings
router.get('/', getSettings);

// Update user settings
router.put('/', updateSettings);

export default router; 