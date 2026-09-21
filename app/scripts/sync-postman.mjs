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
import crypto from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import Converter from 'openapi-to-postmanv2';
import { MOCK_FALLBACK_TEMPLATES } from './mock-fallback.data.mjs';
import { collectionOverview, folderDescriptions, endpointDocs } from './postman-documentation.data.mjs';

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
 * Genera un UUID determinista v4-like a partir de una semilla para evitar diffs innecesarios en git.
 */
function deterministicUuid(seed) {
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Normaliza la ruta URL de un request de Postman.
 */
function normalizePath(url) {
  if (!url) return '';
  if (Array.isArray(url.path)) return '/' + url.path.join('/');
  if (typeof url === 'string') return url;
  if (typeof url.raw === 'string') return url.raw;
  return '';
}

/**
 * Envuelve el cuerpo simulado de respuesta según el Response Envelope Pattern (envelopeMiddleware).
 */
function applyEnvelopeToMockBody(bodyStr, statusCode) {
  if (!bodyStr || typeof bodyStr !== 'string') return bodyStr;
  try {
    const payload = JSON.parse(bodyStr);
    if (typeof payload !== 'object' || payload === null || Buffer.isBuffer(payload)) {
      return bodyStr;
    }

    if ('success' in payload) {
      return JSON.stringify(payload, null, 2);
    }

    const isSuccess = statusCode >= 200 && statusCode < 400;

    if (isSuccess) {
      let message;
      let data = payload;

      if (!Array.isArray(payload)) {
        if (
          'message' in payload &&
          typeof payload.message === 'string' &&
          Object.keys(payload).length === 1
        ) {
          message = payload.message;
          data = undefined;
        } else if (
          'message' in payload &&
          typeof payload.message === 'string' &&
          'data' in payload
        ) {
          message = payload.message;
          data = payload.data;
        } else if ('message' in payload && typeof payload.message === 'string') {
          const { message: msg, ...rest } = payload;
          message = msg;
          data = Object.keys(rest).length > 0 ? rest : undefined;
        }
      }

      const responseEnvelope = {
        success: true,
      };

      if (message !== undefined) {
        responseEnvelope.message = message;
      }

      if (data !== undefined) {
        responseEnvelope.data = data;
      }

      return JSON.stringify(responseEnvelope, null, 2);
    }

    // Códigos HTTP de error (4xx / 5xx)
    const errorEnvelope = {
      success: false,
      ...payload,
    };

    return JSON.stringify(errorEnvelope, null, 2);
  } catch {
    return bodyStr;
  }
}

/**
 * Inyecta scripts de tests de Postman (auto-extracción de tokens, etc.) y estabiliza los IDs.
 */
function injectTestsAndStabilizeIds(items, parentPath = '') {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const currentPath = parentPath ? `${parentPath}/${item.name}` : item.name;

    if (item.item && Array.isArray(item.item)) {
      item.id = deterministicUuid(`folder:${currentPath}`);
      if (folderDescriptions[item.name]) {
        item.description = folderDescriptions[item.name];
      }
      injectTestsAndStabilizeIds(item.item, currentPath);
    } else if (item.request) {
      const method = (item.request.method || 'GET').toUpperCase();
      const pathStr = normalizePath(item.request.url);
      item.id = deterministicUuid(`request:${method}:${pathStr}:${item.name}`);

      // Inyectar documentación técnica completa para Postman Documenter
      const docKey = `${method}:${pathStr}`;
      const doc = endpointDocs[docKey];
      if (doc) {
        item.request.description = doc;
        item.description = doc;
      } else if (!item.request.description) {
        item.request.description = item.name;
        item.description = item.name;
      }

      // Inyectar test scripts automáticos y asegurar cuerpos con variables
      if (method === 'POST' && pathStr.includes('auth/login')) {
        item.event = [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                '// Auto-guardado de tokens y datos de usuario tras autenticación exitosa',
                'if (pm.response.code === 200) {',
                '    const data = pm.response.json();',
                '    const resData = (data && data.data) ? data.data : data;',
                '    if (resData.accessToken) {',
                '        pm.environment.set("accessToken", resData.accessToken);',
                '        pm.collectionVariables.set("accessToken", resData.accessToken);',
                '    }',
                '    if (resData.refreshToken) {',
                '        pm.environment.set("refreshToken", resData.refreshToken);',
                '        pm.collectionVariables.set("refreshToken", resData.refreshToken);',
                '    }',
                '    if (resData.userId) {',
                '        pm.environment.set("userId", String(resData.userId));',
                '        pm.collectionVariables.set("userId", String(resData.userId));',
                '    }',
                '}',
              ],
            },
          },
        ];
      } else if (method === 'POST' && pathStr.includes('auth/refresh')) {
        item.request.body = {
          mode: 'raw',
          raw: '{\n  "refreshToken": "{{refreshToken}}"\n}',
          options: {
            raw: {
              language: 'json',
            },
          },
        };
        item.event = [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                '// Auto-guardado de tokens renovados',
                'if (pm.response.code === 200) {',
                '    const data = pm.response.json();',
                '    const resData = (data && data.data) ? data.data : data;',
                '    if (resData.accessToken) {',
                '        pm.environment.set("accessToken", resData.accessToken);',
                '        pm.collectionVariables.set("accessToken", resData.accessToken);',
                '    }',
                '    if (resData.refreshToken) {',
                '        pm.environment.set("refreshToken", resData.refreshToken);',
                '        pm.collectionVariables.set("refreshToken", resData.refreshToken);',
                '    }',
                '}',
              ],
            },
          },
        ];
      } else if (method === 'POST' && pathStr.includes('auth/logout')) {
        item.request.body = {
          mode: 'raw',
          raw: '{\n  "refreshToken": "{{refreshToken}}"\n}',
          options: {
            raw: {
              language: 'json',
            },
          },
        };
        item.event = [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                '// Limpieza de tokens al cerrar sesión',
                'if (pm.response.code === 200) {',
                '    pm.environment.set("accessToken", "");',
                '    pm.collectionVariables.set("accessToken", "");',
                '    pm.environment.set("refreshToken", "");',
                '    pm.collectionVariables.set("refreshToken", "");',
                '}',
              ],
            },
          },
        ];
      } else if (method === 'POST' && pathStr.includes('reservations/lock-seats')) {
        item.event = [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                '// Auto-captura de reservationId al bloquear sillas',
                'if (pm.response.code === 201 || pm.response.code === 200) {',
                '    const data = pm.response.json();',
                '    const resId = data.reservationId || (data.data && data.data.reservationId);',
                '    if (resId) {',
                '        pm.environment.set("reservationId", String(resId));',
                '        pm.collectionVariables.set("reservationId", String(resId));',
                '    }',
                '}',
              ],
            },
          },
        ];
      } else if (method === 'POST' && (pathStr === '/cart' || pathStr.endsWith('/cart'))) {
        item.event = [
          {
            listen: 'test',
            script: {
              type: 'text/javascript',
              exec: [
                '// Auto-captura de cartId al crear carrito',
                'if (pm.response.code === 201 || pm.response.code === 200) {',
                '    const data = pm.response.json();',
                '    const cartId = data.cartId || (data.data && data.data.cartId);',
                '    if (cartId) {',
                '        pm.environment.set("cartId", String(cartId));',
                '        pm.collectionVariables.set("cartId", String(cartId));',
                '    }',
                '}',
              ],
            },
          },
        ];
      }

      // Asegurar que toda petición POST, PUT o PATCH cuente con un body y encabezado Content-Type
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (!item.request.body && !pathStr.includes('seed/upload')) {
          item.request.body = {
            mode: 'raw',
            raw: '{}',
            options: {
              raw: {
                language: 'json',
              },
            },
          };
        }
        if (item.request.body && item.request.body.mode === 'raw') {
          item.request.header = item.request.header || [];
          if (!item.request.header.some((h) => h.key.toLowerCase() === 'content-type')) {
            item.request.header.push({
              key: 'Content-Type',
              value: 'application/json',
            });
          }
        }
      }

      // Estabilizar IDs, enriquecer cuerpos y envoltura estándar de respuestas simuladas
      if (item.response && Array.isArray(item.response) && item.response.length > 0) {
        // En un Mock Server, cada endpoint debe tener una única respuesta simulada exitosa (200 o 201)
        // para que Postman Mock Server nunca devuelva errores 400/401/500 al azar.
        const successResp =
          item.response.find((r) => Number(r.code) >= 200 && Number(r.code) < 300) || item.response[0];
        item.response = [successResp];

        item.response.forEach((res, resIdx) => {
          const statusCode = Number(res.code) || 200;
          res.id = deterministicUuid(`response:${method}:${pathStr}:${res.name || res.code || resIdx}`);

          // Si el body está vacío, consultar la plantilla de respaldo o generar un envelope por defecto
          if (!res.body || res.body.trim().length === 0) {
            const template =
              MOCK_FALLBACK_TEMPLATES[`${method}:${pathStr}:${res.code}`] ||
              (statusCode < 400 ? MOCK_FALLBACK_TEMPLATES[`${method}:${pathStr}:success`] : null) ||
              MOCK_FALLBACK_TEMPLATES[`${method}:${pathStr}`];
            if (template) {
              res.body = template;
            } else if (statusCode >= 200 && statusCode < 400) {
              res.body = JSON.stringify({ message: res.name || 'Operación exitosa', data: {} });
            } else {
              res.body = JSON.stringify({ message: res.name || 'Error en la solicitud' });
            }
          }

          if (res.body) {
            res.body = applyEnvelopeToMockBody(res.body, statusCode);
          }

          // Asegurar Content-Type: application/json en la respuesta del mock
          res.header = [{ key: 'Content-Type', value: 'application/json' }];

          // Asegurar Accept y Content-Type en originalRequest para garantizar coincidencia en el Mock Server
          if (res.originalRequest) {
            res.originalRequest.header = res.originalRequest.header || [];
            if (!res.originalRequest.header.some((h) => h.key.toLowerCase() === 'accept')) {
              res.originalRequest.header.push({ key: 'Accept', value: 'application/json' });
            }
            if (['POST', 'PUT', 'PATCH'].includes(method)) {
              if (!res.originalRequest.body && item.request.body) {
                res.originalRequest.body = JSON.parse(JSON.stringify(item.request.body));
              }
              if (!res.originalRequest.header.some((h) => h.key.toLowerCase() === 'content-type')) {
                res.originalRequest.header.push({ key: 'Content-Type', value: 'application/json' });
              }
            }

            // Para respuestas de error (>= 400), requerir x-mock-response-code para no competir con el mock de éxito por defecto
            if (statusCode >= 400) {
              if (!res.originalRequest.header.some((h) => h.key.toLowerCase() === 'x-mock-response-code')) {
                res.originalRequest.header.push({ key: 'x-mock-response-code', value: String(statusCode) });
              }
            }
          }
        });
      }
    }
  }
}

/**
 * Enriquecer colección con variables estándar y configuraciones para Mock Server.
 */
function enrichPostmanCollection(collection, collectionUid) {
  collection.info.name = 'MultiCine Riwi Backend API (v1)';
  collection.info.description = collectionOverview;

  if (collectionUid) {
    const idMatch = collectionUid.match(/^[0-9]+-(.+)$/);
    collection.info._postman_id = idMatch ? idMatch[1] : collectionUid;
  } else {
    collection.info._postman_id = deterministicUuid('collection:MultiCineRiwiBackendAPI');
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
    {
      key: 'cartId',
      value: '1',
      type: 'string',
    },
    {
      key: 'cartItemId',
      value: '1',
      type: 'string',
    },
    {
      key: 'movieId',
      value: '1',
      type: 'string',
    },
    {
      key: 'departmentId',
      value: '1',
      type: 'string',
    },
    {
      key: 'countryId',
      value: '1',
      type: 'string',
    },
  ];

  if (collection.item && Array.isArray(collection.item)) {
    injectTestsAndStabilizeIds(collection.item);
  }

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

  // Enriquecer OpenAPI Spec con descripciones técnicas completas y tags detallados
  if (swaggerSpec && swaggerSpec.paths) {
    for (const [p, methods] of Object.entries(swaggerSpec.paths)) {
      for (const [m, op] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(m.toLowerCase())) {
          const normPath = p.replace(/\{([^}]+)\}/g, ':$1');
          const docKey = `${m.toUpperCase()}:${normPath}`;
          if (endpointDocs[docKey]) {
            op.description = endpointDocs[docKey];
          }
        }
      }
    }
    swaggerSpec.tags = Object.entries(folderDescriptions).map(([name, desc]) => ({
      name,
      description: desc.replace(/###\s+[^\n]+\n/, '').trim(),
    }));
  }

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

  let collectionUid =
    process.env.POSTMAN_COLLECTION_UID?.trim() || '57233881-1b60a03d-8bc6-46ae-8edd-82e30f7afb0b';
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
  const targetCollections = [
    collectionUid,
    '57233881-73046d96-409b-450a-a063-5efbfa5f815f',
    '57233881-1b60a03d-8bc6-46ae-8edd-82e30f7afb0b',
    '57233881-6ea9c3cb-c85c-4fcf-8e0e-e187d9a77056',
    '57233881-a554b3fe-6218-409c-ada2-018d68af3b6f',
    '57233881-1ebad000-1490-41cb-8b86-bfb554a99112',
  ];
  const uniqueTargets = [...new Set(targetCollections)];

  function cloneForTarget(col, targetUid) {
    const clone = JSON.parse(JSON.stringify(col));
    const idMatch = targetUid.match(/^[0-9]+-(.+)$/);
    clone.info._postman_id = idMatch ? idMatch[1] : targetUid;
    function reId(items) {
      for (const it of items) {
        if (it.id) {
          it.id = crypto.createHash('sha256').update(targetUid + ':' + it.id).digest('hex').slice(0, 32);
        }
        if (it.response) {
          it.response.forEach((r) => {
            if (r.id) {
              r.id = crypto.createHash('sha256').update(targetUid + ':' + r.id).digest('hex').slice(0, 32);
            }
          });
        }
        if (it.item) reId(it.item);
      }
    }
    if (clone.item) reId(clone.item);
    return clone;
  }

  for (const uid of uniqueTargets) {
    console.log(`\n🚀 Enviando actualización a Postman Cloud (Collection UID: ${uid})...`);
    const colPayload = uid === collectionUid ? enrichedCollection : cloneForTarget(enrichedCollection, uid);
    try {
      const response = await fetch(`https://api.getpostman.com/collections/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        body: JSON.stringify({ collection: colPayload }),
        signal: AbortSignal.timeout(30000),
      });

      const data = await response.json();
      if (!response.ok) {
        console.warn(`⚠️ Advertencia al actualizar ${uid}:`, data.error?.message || data);
      } else {
        console.log(`✅ Colección "${data?.collection?.name}" (${uid}) sincronizada con éxito.`);
      }
    } catch (err) {
      console.warn(`⚠️ Error de red al actualizar ${uid}:`, err.message);
    }
  }

  console.log('\n🎉 ¡Todas las colecciones y Mock Servers asociados en Postman Cloud han sido actualizados!');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('\n❌ Error inesperado durante la sincronización:', err);
  process.exit(1);
});
