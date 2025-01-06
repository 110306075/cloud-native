import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const SECRET_KEY = process.env.JWT_SECRET_KEY;
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }
  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: err });
  }
};
