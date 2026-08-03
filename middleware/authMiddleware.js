// authmiddleware.js
import jwt from 'jsonwebtoken';
export const authMiddleware = (req, res, next) => {
  // Never let browsers/proxies cache authenticated responses. Without this,
  // Express ETags cause GET /profile (and other protected GETs) to be
  // revalidated and returned as 304, which the frontend treats as a failure.
  res.set('Cache-Control', 'no-store');
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};