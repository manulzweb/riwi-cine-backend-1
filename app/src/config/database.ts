// /app/src/config/database.ts

/**
 * Configuración de Sequelize para PostgreSQL
 * ------------------------------------------
 * Este módulo inicializa y exporta una instancia de Sequelize,
 * se configurada con las variables de entorno definidas en `.env` o en `docker-compose`.
 *
 * Uso principal:
 *  - Establecer la conexión con la base de datos PostgreSQL.
 *  - Ser importado por los modelos y utilidades que requieran interactuar con Sequelize.
 *
 * Variables de entorno utilizadas:
 *  - POSTGRES_DB: Nombre de la base de datos.
 *  - POSTGRES_USER: Usuario de conexión a la base de datos.
 *  - POSTGRES_PASSWORD: Contraseña del usuario de la base de datos.
 *  - POSTGRES_HOST: Host de la base de datos (por defecto `db` para docker-compose).
 *  - POSTGRES_PORT: Puerto de conexión (por defecto `5432`).
 */

import { Sequelize } from 'sequelize';

/**
 * Instancia de Sequelize configurada para PostgreSQL.
 * Se conecta utilizando las credenciales y parámetros definidos en las variables de entorno.
 */
const sequelize = new Sequelize(
  process.env.POSTGRES_DB as string,
  process.env.POSTGRES_USER as string,
  process.env.POSTGRES_PASSWORD as string,
  {
    host: process.env.POSTGRES_HOST || 'db', // En docker-compose, el servicio de la BD se llama "db"
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false, // Desactiva logs SQL en consola (útil en producción)
  },
);

export default sequelize;
