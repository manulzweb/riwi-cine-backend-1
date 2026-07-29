// ruta_avanzada/proyecto_incremental/app/src/index.ts

/**
 * Es el entrypoint real de la aplicación.
 * Se encarga de:
 * - Levantar la base de datos (sequelize.authenticate + sequelize.sync).
 * - Arrancar el servidor (app.listen).
 * - Es el que realmente ejecutas cuando corres npm run dev o docker-compose up.
 */

import app from "./server";
import sequelize from "./config/database";

const PORT = process.env.APP_PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a la BD establecida...");

    await sequelize.sync({
      alter: true
    }); // crea tablas si no existen

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar a la BD :", error);
    process.exit(1);
  }
};

start();