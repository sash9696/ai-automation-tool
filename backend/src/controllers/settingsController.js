// Mock settings storage
let settings = {
  defaultPostTime: '09:00',
  preferredTopics: ['fullstack'],
  linkedInConnected: false,
  autoSchedule: false
};

export const getSettings = (req, res) => {
  try {
    res.json({
      success: true,
      data: settings,
      message: 'Settings retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
};

export const updateSettings = (req, res) => {
  try {
    const updates = req.body;
    
    // Validate updates
    if (updates.defaultPostTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updates.defaultPostTime)) {
      return res.status(400).json({ error: 'Invalid time format' });
    }

    if (updates.preferredTopics && !Array.isArray(updates.preferredTopics)) {
      return res.status(400).json({ error: 'Preferred topics must be an array' });
    }

    // Update settings
    settings = { ...settings, ...updates };

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}; 