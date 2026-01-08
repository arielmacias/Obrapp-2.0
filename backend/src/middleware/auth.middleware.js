import jwt from "jsonwebtoken";

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const fallbackEquipoId = Number(process.env.DEFAULT_EQUIPO_ID) || 1;
    req.user = {
      id: decoded.id,
      role: decoded.role ?? decoded.rol,
      equipo_id: decoded.equipo_id ?? fallbackEquipoId,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: "No autorizado" });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ error: "No autorizado" });
  }

  return next();
};

export default requireAuth;
