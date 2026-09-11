#!/usr/bin/env node

/**
 * ============================================================================
 * Pipeline Automatizado: OpenAPI (Swagger) → Postman Collection → Mock Server
 * ============================================================================
 *
 * Flujo:
 * 1. Extrae la especificación OpenAPI 3.0 compilada en memoria por `swagger-jsdoc`.
 * 2. Convierte la especificación a formato Postman Collection v2.1.0 usando
 *    la librería oficial `openapi-to-postmanv2`.
 * 3. Inyecta y preserva variables de entorno estándar (baseUrl, accessToken, etc.).
 * 4. Actualiza el archivo local `riwi_cine_api.postman_collection.json`.
 * 5. Si se proporcionan credenciales (o en CI/CD), sincroniza directamente con
 *    Postman Cloud API (PUT /collections/:uid), actualizando instantáneamente
 *    tanto la Collection remota como el Mock Server asociado.
 *
 * Modos de ejecución:
 *   node scripts/sync-postman.mjs                # Genera y sube a Postman Cloud
 *   node scripts/sync-postman.mjs --generate-only # Solo genera archivos locales
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import Converter from 'openapi-to-postmanv2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(appDir, '..');

// Asegurar que el directorio de trabajo sea siempre appDir para resolver correctamente los globs de Swagger
process.chdir(appDir);

// 1. Cargar variables de entorno desde .env o app/.env si no vienen inyectadas
const rootEnvPath = path.resolve(rootDir, '.env');
const appEnvPath = path.resolve(appDir, '.env');

if (!process.env.POSTMAN_API_KEY || !process.env.POSTMAN_COLLECTION_UID) {
  if (fs.existsSync(rootEnvPath)) {
    try {
      process.loadEnvFile(rootEnvPath);
    } catch {
      // Ignorar si falla lectura de archivo
    }
  } else if (fs.existsSync(appEnvPath)) {
    try {
      process.loadEnvFile(appEnvPath);
    } catch {
      // Ignorar si falla lectura de archivo
    }
  }
}

const OUTPUT_COLLECTION_FILE = path.resolve(rootDir, 'riwi_cine_api.postman_collection.json');
const OUTPUT_OPENAPI_FILE = path.resolve(rootDir, 'docs', 'openapi.json');
const isGenerateOnly = process.argv.includes('--generate-only');

/**
 * Obtiene swaggerSpec importando TypeScript directamente (Node 22) o desde dist.
 */
async function loadSwaggerSpec() {
  const tsPath = path.resolve(appDir, 'src', 'docs', 'swagger.ts');
  const jsPath = path.resolve(appDir, 'dist', 'docs', 'swagger.js');

  try {
    const module = await import(tsPath);
    return module.swaggerSpec;
  } catch {
    const module = await import(jsPath);
    return module.swaggerSpec;
  }
}

/**
 * Convierte especificación OpenAPI a Postman Collection v2.1 de forma asíncrona.
 */
function convertOpenApiToPostman(openApiSpec) {
  const options = {
    folderStrategy: 'Tags',
    requestParametersResolution: 'Example',
    exampleAttributePropagation: true,
    includeAuthInfoInExample: true,
    optimizeConversion: true,
    stackLimit: 50,
  };

  return new Promise((resolve, reject) => {
    Converter.convert(
      { type: 'json', data: openApiSpec },
      options,
      (err, conversionResult) => {
        if (err) {
          return reject(err);
        }
        if (!conversionResult.result) {
          return reject(
            new Error(conversionResult.reason || 'Error en la conversión de OpenAPI a Postman'),
          );
        }
        resolve(conversionResult.output[0].data);
      },
    );
  });
}

/**
 * Enriquecer colección con variables estándar y configuraciones para Mock Server.
 */
function enrichPostmanCollection(collection, collectionUid) {
  collection.info.name = 'MultiCine Riwi Backend API (v1)';
  collection.info.description =
    'Colección sincronizada automáticamente desde OpenAPI (Swagger JSDoc). Contiene contratos oficiales con envoltura estandarizada, parámetros, esquemas y respuestas simuladas para Postman Mock Server.';

  if (collectionUid) {
    const idMatch = collectionUid.match(/^[0-9]+-(.+)$/);
    collection.info._postman_id = idMatch ? idMatch[1] : collectionUid;
  }

  // Asegurar variables de entorno y soporte para autenticación Bearer
  collection.variable = [
    {
      key: 'baseUrl',
      value: 'http://localhost:3000/api/v1',
      type: 'string',
    },
    {
      key: 'accessToken',
      value: '',
      type: 'string',
    },
    {
      key: 'refreshToken',
      value: '',
      type: 'string',
    },
    {
      key: 'bearerToken',
      value: '{{accessToken}}',
      type: 'string',
    },
    {
      key: 'userId',
      value: '1',
      type: 'string',
    },
    {
      key: 'functionId',
      value: '1',
      type: 'string',
    },
    {
      key: 'reservationId',
      value: '1',
      type: 'string',
    },
  ];

  return collection;
}

async function main() {
  console.log('\n======================================================');
  console.log('  🎬 Sincronizador Automático OpenAPI → Postman       ');
  console.log('======================================================\n');

  // 1. Cargar OpenAPI Spec desde el código fuente
  console.log('⚙️  Extrayendo especificación OpenAPI desde Swagger JSDoc...');
  const swaggerSpec = await loadSwaggerSpec();
  const totalPaths = Object.keys(swaggerSpec?.paths || {}).length;
  console.log(`✅ OpenAPI Spec extraída con éxito: ${totalPaths} endpoints detectados.`);

  // Exportar openapi.json de respaldo si la carpeta docs existe
  try {
    const docsDir = path.dirname(OUTPUT_OPENAPI_FILE);
    if (fs.existsSync(docsDir)) {
      fs.writeFileSync(OUTPUT_OPENAPI_FILE, JSON.stringify(swaggerSpec, null, 2), 'utf-8');
      console.log(`📄 Esquema OpenAPI guardado en: ${path.relative(rootDir, OUTPUT_OPENAPI_FILE)}`);
    }
  } catch {
    // Si no se puede guardar openapi.json, continuar sin detener el flujo
  }

  // 2. Convertir OpenAPI a Postman Collection
  console.log('🔄 Convirtiendo OpenAPI 3.0 a Postman Collection v2.1...');
  const collection = await convertOpenApiToPostman(swaggerSpec);

  let collectionUid = process.env.POSTMAN_COLLECTION_UID?.trim();
  const enrichedCollection = enrichPostmanCollection(collection, collectionUid);

  // 3. Escribir archivo local de Postman Collection
  fs.writeFileSync(
    OUTPUT_COLLECTION_FILE,
    JSON.stringify(enrichedCollection, null, 2),
    'utf-8',
  );
  console.log(
    `💾 Colección local guardada en: ${path.relative(rootDir, OUTPUT_COLLECTION_FILE)} (${enrichedCollection.item.length} carpetas/tags)`,
  );

  if (isGenerateOnly) {
    console.log('\n✨ Modo --generate-only finalizado. Archivos locales actualizados.');
    console.log('======================================================\n');
    return;
  }

  // 4. Obtener credenciales de Postman para la subida
  let apiKey = process.env.POSTMAN_API_KEY?.trim();

  const isCI = !!process.env.CI;
  if (!apiKey && isCI) {
    console.error('❌ En entorno CI/CD, POSTMAN_API_KEY es requerida en los secrets.');
    process.exit(1);
  }

  if (!collectionUid && isCI) {
    console.error('❌ En entorno CI/CD, POSTMAN_COLLECTION_UID es requerida en los secrets.');
    process.exit(1);
  }

  // Si no estamos en CI y faltan credenciales, pedir interactivamente
  if (!apiKey || !collectionUid) {
    const rl = readline.createInterface({ input, output });

    if (!apiKey) {
      apiKey = (await rl.question('👉 Ingresa tu Postman API Key (PMAK-...): ')).trim();
      if (!apiKey) {
        console.error('❌ La Postman API Key es obligatoria para sincronizar.');
        rl.close();
        process.exit(1);
      }
    }

    if (!collectionUid) {
      collectionUid = (await rl.question('👉 Ingresa el Collection UID (ej. 12345678-abcd-...): ')).trim();
      if (!collectionUid) {
        console.error('❌ El Collection UID es obligatorio para sincronizar.');
        rl.close();
        process.exit(1);
      }
    }

    rl.close();
  }

  // 5. Enviar actualización a Postman Cloud API
  console.log(`\n🚀 Enviando actualización a Postman Cloud (Collection UID: ${collectionUid})...`);
  const payload = JSON.stringify({ collection: enrichedCollection });

  try {
    const response = await fetch(`https://api.getpostman.com/collections/${collectionUid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: payload,
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('\n❌ Error devuelto por la API de Postman:');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('\n🎉 ¡Colección actualizada con éxito en Postman Cloud!');
    console.log(`   • ID:     ${data?.collection?.id}`);
    console.log(`   • Nombre: ${data?.collection?.name}`);
    console.log(`   • UID:    ${data?.collection?.uid}`);
    console.log('\n📡 Tu Mock Server asociado ya está reflejando los nuevos endpoints y respuestas.');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ Error de red al comunicarse con la API de Postman:', error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n❌ Error inesperado durante la sincronización:', err);
  process.exit(1);
});
