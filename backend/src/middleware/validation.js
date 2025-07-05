export const validateGeneratePost = (req, res, next) => {
  const { topic, tone } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Topic is required and must be a non-empty string' });
  }

  if (tone && typeof tone !== 'string') {
    return res.status(400).json({ error: 'Tone must be a string' });
  }

  next();
};

export const validateSchedulePost = (req, res, next) => {
  const { scheduledTime } = req.body;

  if (!scheduledTime) {
    return res.status(400).json({ error: 'Scheduled time is required' });
  }

  const scheduledDate = new Date(scheduledTime);
  if (isNaN(scheduledDate.getTime())) {
    return res.status(400).json({ error: 'Invalid scheduled time format' });
  }

  if (scheduledDate <= new Date()) {
    return res.status(400).json({ error: 'Scheduled time must be in the future' });
  }

  next();
}; 