export function notFound(req, res) { res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` }); }
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || (error.type === 'entity.parse.failed' || error.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ success: false, message: status === 500 && process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message || 'Something went wrong' });
}
