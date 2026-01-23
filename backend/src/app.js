import cors from "cors";
import express from "express";

import authRoutes from "./routes/auth.routes.js";
import obrasRoutes from "./routes/obras.routes.js";
import cuentasRoutes from "./routes/cuentas.routes.js";

const app = express();

const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/obras", obrasRoutes);
app.use("/api/cuentas", cuentasRoutes);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Error interno";
  res.status(status).json({
    ok: false,
    data: null,
    message,
    errors: err.errors || null,
  });
});

export default app;
