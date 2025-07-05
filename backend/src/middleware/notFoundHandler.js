export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    message: 'The requested endpoint does not exist'
  });
}; 