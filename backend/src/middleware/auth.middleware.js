import jwt from "jsonwebtoken";

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, rol: decoded.rol };
    return next();
  } catch (error) {
    return res.status(401).json({ error: "No autorizado" });
  }
};

export default requireAuth;
