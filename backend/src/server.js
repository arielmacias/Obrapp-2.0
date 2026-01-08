import "dotenv/config";

import app from "./app.js";
import { ensureSchema } from "./db/migrate.js";

const port = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await ensureSchema();
    app.listen(port, () => {
      console.log(`Backend listo en http://localhost:${port}`);
    });
  } catch (error) {
    console.error("No se pudo inicializar la base de datos.", error);
    process.exit(1);
  }
};

startServer();
