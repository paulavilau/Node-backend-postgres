import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Token lipsa" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // aici pui id-ul userului (sau orice ai pus in payload)
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalid sau expirat" });
  }
};
