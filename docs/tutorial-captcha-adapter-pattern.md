# Tutorial: Integrar reCAPTCHA v2 con el patrón Adapter

> Objetivo: proteger `POST /api/auth/register` con Google reCAPTCHA **v2** usando el
> **Adapter Pattern**, de forma que mañana puedas cambiar a Enterprise, hCaptcha o
> Cloudflare Turnstile sin tocar el flujo de registro.

## Tabla de contenidos

1. [El problema](#1-el-problema)
2. [Qué es el Adapter Pattern](#2-qué-es-el-adapter-pattern)
3. [Cómo funciona reCAPTCHA v2](#3-cómo-funciona-recaptcha-v2)
4. [Paso 0 — Obtener las llaves](#4-paso-0--obtener-las-llaves)
5. [Paso 1 — Configuración en `env.ts`](#5-paso-1--configuración-en-envts)
6. [Paso 2 — La interfaz `ICaptchaAdapter`](#6-paso-2--la-interfaz-icaptchaadapter)
7. [Paso 3 — El adaptador real `RecaptchaV2Adapter`](#7-paso-3--el-adaptador-real-recaptchav2adapter)
8. [Paso 4 — El adaptador falso `NoopCaptchaAdapter`](#8-paso-4--el-adaptador-falso-noopcaptchaadapter)
9. [Paso 5 — El factory: elegir adaptador por configuración](#9-paso-5--el-factory-elegir-adaptador-por-configuración)
10. [Paso 6 — El middleware Express](#10-paso-6--el-middleware-express)
11. [Paso 7 — Conectar la ruta y actualizar Swagger](#11-paso-7--conectar-la-ruta-y-actualizar-swagger)
12. [Paso 8 — Tests](#12-paso-8--tests)
13. [La prueba del algodón: cambiar de proveedor](#13-la-prueba-del-algodón-cambiar-de-proveedor)
14. [Errores comunes y notas de seguridad](#14-errores-comunes-y-notas-de-seguridad)

---

## 1. El problema

Sin abstracción, la verificación captcha queda acoplada al proveedor:

```ts
// Acoplado: si mañana cambias a hCaptcha, esto se rompe en N lugares
const response = await fetch('https://www.google.com/recaptcha/api/siteverify', ...);
if (!data.success) { /* ... */ }
```

| Problema | Consecuencia |
|---|---|
| URL y contrato del proveedor hardcodeados | Cambiar de proveedor = buscar/reemplazar en todo el repo |
| Llamada HTTP externa dentro del flujo de negocio | Tests lentos y frágiles; necesitas internet para testear |
| Sin forma de desactivar en desarrollo | Cada dev necesita llaves reales de Google |

## 2. Qué es el Adapter Pattern

> **Definición**: convierte la interfaz de una clase externa en otra interfaz que tu
> aplicación espera. Es un *traductor* entre tu dominio y un tercero que no controlas.

```text
+----------------+      +----------------------+      +------------------+
|  Tu app        |      |  ADAPTER (traductor) |      |  Proveedor       |
|                |      |                      |      |                  |
|  Middleware ---+----->| ICaptchaAdapter      +----->| reCAPTCHA v2     |
|  captcha       |      |   .verify(token)     |      | hCaptcha mañana  |
|                |      |                      |      | Turnstile luego  |
+----------------+      +----------------------+      +------------------+
  habla "español"          traduce al dialecto          cada uno habla su
  (success / fail)         propio del proveedor         propio dialecto JSON
```

**Adapter vs Strategy** (se confunden mucho):

- **Strategy**: intercambias *algoritmos* de la misma familia que tú implementas
  (ej: ordenar por fecha vs por nombre).
- **Adapter**: *traduce* una API externa hacia TU interfaz homogénea.

Aquí usamos Adapter porque Google responde con su propio formato
(`{ success, challenge_ts, 'error-codes': [...] }`) y nosotros solo queremos exponer:
`verify(token) -> pasa / no pasa`.

## 3. Cómo funciona reCAPTCHA v2

Tres actores:

```text
1. FRONTEND                 2. TU BACKEND                    3. GOOGLE
   Usuario resuelve el         POST /register                   POST /siteverify
   widget "No soy robot"  -->  body.captchaToken = xxx   ---->  secret + response=xxx
                               |                                |
                               |                          <---- { success: true }
                               | <--- middleware valida
                               v
                        continúa al controller
```

1. El **frontend** renderiza el widget con tu `SITE_KEY`. Al resolverlo, genera un
   token efímero (de un solo uso, expira en ~2 minutos).
2. El frontend envía ese token junto con el formulario (`captchaToken`).
3. El **backend** lo valida contra `https://www.google.com/recaptcha/api/siteverify`
   enviando tu `SECRET_KEY` (que NADIE más conoce).

Reglas de oro: la **site key** va en el frontend (es pública), la **secret key** vive
solo en el backend (.env).

---

## 4. Paso 0 — Obtener las llaves

1. Entra a <https://www.google.com/recaptcha/admin/create>
2. Selecciona **reCAPTCHA v2 → "Checkbox"**
3. Registra tu dominio (en dev: `localhost`)
4. Copia las dos llaves:

```bash
# app/.env
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RECAPTCHA_SECRET_KEY=6Lyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

Para pruebas automatizadas existen llaves de prueba oficiales que siempre pasan:

- site key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- secret: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

(Úsalas solo en `NODE_ENV=test`/dev, nunca en producción.)

---

## 5. Paso 1 — Configuración en `env.ts`

Sigue el patrón existente del archivo `app/src/config/env.ts` (helper `required()` +
objeto plano `envConfig`). Añade un bloque `RECAPTCHA`:

```ts
// app/src/config/env.ts
const isTruthy = (value: string | undefined): boolean => value === 'true';

export const envConfig = {
  // ... configuración existente ...

  RECAPTCHA: {
    // Apagable sin tocar código: útil en dev y desactivado en tests
    ENABLED: process.env.NODE_ENV !== 'test' && isTruthy(process.env.RECAPTCHA_ENABLED),
    SITE_KEY: process.env.RECAPTCHA_SITE_KEY ?? '',
    SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY ?? '',
    // Fail-closed: si Google no responde, se rechaza la petición
    TIMEOUT_MS: Number(process.env.RECAPTCHA_TIMEOUT_MS ?? 5000),
    VERIFY_URL: 'https://www.google.com/recaptcha/api/siteverify',
  },
};
```

Notas de diseño:

- **No usamos `required()` aquí** porque el captcha puede estar apagado
  (`RECAPTCHA_ENABLED=false`): exigir llaves cuando están apagadas obligaría a todo
  el equipo a tenerlas.
- La validación "si está encendido, las llaves deben existir" la haremos en el
  constructor del adaptador (fail-fast al arrancar, no en la primera petición).

---

## 6. Paso 2 — La interfaz `ICaptchaAdapter`

Este es **el corazón del patrón**: un contrato propio que define lo que TU app
necesita, sin importar quién lo implemente.

```ts
// app/src/services/captcha/captcha.adapter.ts

/**
 * Resultado homogéneo de una verificación captcha.
 *
 * Ningún adaptador debe filtrar detalles del proveedor hacia afuera:
 * la razón es para logs internos, nunca para el cliente.
 */
export type CaptchaResult =
  | { success: true }
  | { success: false; reason: string };

export interface ICaptchaAdapter {
  /**
   * Verifica un token generado por el widget del frontend.
   *
   * @param token Token efímero enviado por el cliente (`captchaToken`).
   * @param remoteIp IP del cliente (opcional; algunos proveedores lo usan
   *                  como señal anti-fraude).
   */
  verify(token: string, remoteIp?: string): Promise<CaptchaResult>;
}
```

Por qué `reason` vive en el resultado y no se lanza una excepción: un captcha
fallido **no es un error del sistema**, es una respuesta esperada de negocio. La
excepción queda reservada para fallos reales (timeout, red), aunque con fail-closed
también se traducen a `{ success: false }`.

---

## 7. Paso 3 — El adaptador real `RecaptchaV2Adapter`

Aquí ocurre la "traducción": tomamos el dialecto de Google
(`success`, `error-codes`) y lo convertimos a nuestro `CaptchaResult`.

```ts
// app/src/services/captcha/recaptcha-v2.adapter.ts

import { envConfig } from '../../config/env';
import { CaptchaResult, ICaptchaAdapter } from './captcha.adapter';

/** Respuesta cruda de https://www.google.com/recaptcha/api/siteverify */
interface GoogleSiteVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export class RecaptchaV2Adapter implements ICaptchaAdapter {
  private readonly secretKey: string;

  constructor(secretKey: string) {
    if (!secretKey) {
      // Fail-fast: mejor explotar al arrancar que en producción
      throw new Error('RECAPTCHA_SECRET_KEY is required when RECAPTCHA_ENABLED=true');
    }
    this.secretKey = secretKey;
  }

  async verify(token: string, remoteIp?: string): Promise<CaptchaResult> {
    try {
      const body = new URLSearchParams({
        secret: this.secretKey,
        response: token,
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      });

      const response = await fetch(envConfig.RECAPTCHA.VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(envConfig.RECAPTCHA.TIMEOUT_MS),
      });

      if (!response.ok) {
        return {
          success: false,
          reason: `siteverify responded with HTTP ${response.status}`,
        };
      }

      const data = (await response.json()) as GoogleSiteVerifyResponse;

      if (!data.success) {
        return {
          success: false,
          reason: data['error-codes']?.join(', ') ?? 'unknown-error',
        };
      }

      return { success: true };
    } catch (error) {
      // Fail-closed: cualquier fallo (timeout, red, JSON inválido) rechaza.
      console.error('reCAPTCHA v2 verification failed:', error);
      return { success: false, reason: 'provider-unavailable' };
    }
  }
}
```

Detalles que importan:

1. **`AbortSignal.timeout()`**: sin timeout, un cuelgue de Google congela tu endpoint
   de registro indefinidamente.
2. **`URLSearchParams` + `x-www-form-urlencoded`**: `siteverify` NO acepta JSON,
   solo form-encoded. Error clásico.
3. **El catch devuelve fail-closed** en vez de relanzar: si GCP/Google cae, no quieres
   tumbar los registros ni decidir caso por caso en el controller.
4. Los `error-codes` de Google (`invalid-input-response`, `missing-input-secret`...)
   van a `reason` → para logs, jamás hacia el cliente.

---

## 8. Paso 4 — El adaptador falso `NoopCaptchaAdapter`

Sirve para desarrollo local sin llaves y para que Jest nunca llame a Google:

```ts
// app/src/services/captcha/noop.adapter.ts

import { CaptchaResult, ICaptchaAdapter } from './captcha.adapter';

/**
 * Adaptador "no-op": acepta todo.
 *
 * Se usa cuando RECAPTCHA_ENABLED=false o NODE_ENV=test.
 * Mismo contrato => intercambiable sin tocar a nadie más.
 */
export class NoopCaptchaAdapter implements ICaptchaAdapter {
  async verify(): Promise<CaptchaResult> {
    return { success: true };
  }
}
```

Esto replica el patrón que ya usa el rate limiter del proyecto:
`skip: () => envConfig.NODE_ENV === 'test'` (`auth.routes.ts`).

---

## 9. Paso 5 — El factory: elegir adaptador por configuración

Un único punto donde se decide QUÉ adaptador usar. Mañana agregas hCaptcha aquí y
nadie más cambia.

```ts
// app/src/services/captcha/index.ts

import { envConfig } from '../../config/env';
import { ICaptchaAdapter } from './captcha.adapter';
import { NoopCaptchaAdapter } from './noop.adapter';
import { RecaptchaV2Adapter } from './recaptcha-v2.adapter';

const createCaptchaAdapter = (): ICaptchaAdapter => {
  if (!envConfig.RECAPTCHA.ENABLED) {
    return new NoopCaptchaAdapter();
  }

  return new RecaptchaV2Adapter(envConfig.RECAPTCHA.SECRET_KEY);
};

// Singleton: un solo adaptador por proceso (igual que password.service, etc.)
const captchaAdapter = createCaptchaAdapter();

export default captchaAdapter;
export { ICaptchaAdapter, CaptchaResult };
```

> **Nota**: `SITE_KEY` no se usa en el backend; es para el frontend. Solo la dejamos
> en env para centralizar la config del proyecto.

---

## 10. Paso 6 — El middleware Express

El middleware es quien "habla español" con el resto de la app: lee `req.body`,
pregunta al adaptador y corta el flujo si falla.

```ts
// app/src/middleware/captcha.middleware.ts

import { NextFunction, Request, Response } from 'express';
import captchaAdapter from '../services/captcha';

/**
 * Factory de middleware: permite declarar la acción esperada por ruta.
 * (Si mañana pasas a Enterprise, cada acción tiene su propia evaluación.)
 */
export const verifyCaptcha =
  () =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.body?.captchaToken;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ message: 'Captcha token is required' });
      return;
    }

    const result = await captchaAdapter.verify(token, req.ip);

    if (!result.success) {
      console.warn(`Captcha rejected: ${result.reason}`);
      // Mensaje genérico: no revelamos si fue score bajo, token usado, etc.
      res.status(403).json({ message: 'Captcha verification failed' });
      return;
    }

    next();
  };
```

Dos decisiones conscientes:

- `400` si falta el token (problema del cliente), `403` si no pasa (verificación).
- El `reason` se loguea en servidor con `console.warn`, pero **nunca** viaja en la
  respuesta: saber por qué falló ayuda a un atacante.

---

## 11. Paso 7 — Conectar la ruta y actualizar Swagger

En `app/src/routes/auth.routes.ts`, encadena el middleware ANTES del controller
(después del rate limiter: primero lo barato, luego lo que cuesta una llamada externa):

```ts
import { verifyCaptcha } from '../middleware/captcha.middleware';

router.post('/register', registerLimiter, verifyCaptcha(), register);
```

Y en el bloque Swagger del endpoint añade el campo requerido y la respuesta nueva:

```yaml
# dentro de requestBody.properties:
captchaToken:
  type: string
  description: "Token generado por el widget reCAPTCHA v2 del frontend"

# dentro de responses:
'403':
  description: Verificación captcha fallida
  content:
    application/json:
      schema:
        type: object
        properties:
          message:
            type: string
            example: "Captcha verification failed"
```

---

## 12. Paso 8 — Tests

La gran victoria del patrón: testear el middleware SIN internet, mockeando `fetch`
global (no hace falta mockear el adapter porque el adaptador es lo que estamos
testeando).

```ts
// app/src/__tests__/middleware/captcha.middleware.test.ts

import request from 'supertest';
import express from 'express';
import { verifyCaptcha } from '../../middleware/captcha.middleware';
import captchaAdapter from '../../services/captcha';

// En NODE_ENV=test el factory devuelve Noop; inyectamos el mock sobre el singleton
jest.mock('../../services/captcha', () => ({
  __esModule: true,
  default: { verify: jest.fn() },
}));

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.post('/test', verifyCaptcha(), (_req, res) => res.status(200).json({ ok: true }));
  return app;
};

describe('verifyCaptcha middleware', () => {
  it('returns 400 when captchaToken is missing', async () => {
    const res = await request(buildApp()).post('/test').send({});
    expect(res.status).toBe(400);
  });

  it('returns 403 when verification fails (fail-closed)', async () => {
    (captchaAdapter.verify as jest.Mock).mockResolvedValue({
      success: false,
      reason: 'invalid-input-response',
    });

    const res = await request(buildApp())
      .post('/test')
      .send({ captchaToken: 'tok' });

    expect(res.status).toBe(403);
    // El motivo interno NUNCA llega al cliente
    expect(res.body.message).toBe('Captcha verification failed');
  });

  it('calls next() when verification succeeds', async () => {
    (captchaAdapter.verify as jest.Mock).mockResolvedValue({ success: true });

    const res = await request(buildApp())
      .post('/test')
      .send({ captchaToken: 'tok' });

    expect(res.status).toBe(200);
  });
});
```

Y para el **adaptador real** (opcional pero recomendado), mockea `global.fetch`:

```ts
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ success: true }),
});
```

Casos que valen la pena cubrir del adapter: HTTP 500 de Google, `success:false` con
`error-codes`, timeout (lanza `AbortError`) y JSON malformado. Todos deben terminar
en `{ success: false }` (fail-closed).

---

## 13. La prueba del algodón: cambiar de proveedor

Imagina que en 3 meses te piden hCaptcha. Esto es TODO lo que haces:

```ts
// app/src/services/captcha/hcaptcha.adapter.ts   <- archivo nuevo
export class HCaptchaAdapter implements ICaptchaAdapter {
  // siteverify de hCaptcha: https://api.hcaptcha.com/siteverify
  // Mismo flujo: POST form-encoded -> { success: boolean }
  async verify(token: string): Promise<CaptchaResult> { /* ... */ }
}
```

```ts
// app/src/services/captcha/index.ts             <- una línea cambiada
return new HCaptchaAdapter(envConfig.RECAPTCHA.SECRET_KEY);
```

Rutas, controllers, tests del middleware y Swagger: **intactos**. Ese es el valor
del patrón: el costo de cambiar de proveedor baja de "revisar todo el repo" a
"un archivo nuevo + una línea".

---

## 14. Errores comunes y notas de seguridad

| Trampa | Por qué duele |
|---|---|
| Mandar JSON a `siteverify` | Solo acepta `application/x-www-form-urlencoded` |
| Validar el captcha solo en el frontend | Cualquiera salta el widget con curl; la verificación server-side es la única real |
| Reutilizar un token | Cada token es de un solo uso; si tu frontend reintenta el POST, genera token nuevo |
| Exponer la `SECRET_KEY` en respuestas/logs | Es el secreto del backend, como un password |
| Mensaje de error detallado al cliente (`"token ya usado"`) | Filtra información útil para evasión; responde genérico y loguea adentro |
| Instanciar el adapter dentro del handler | Crearías configuración por petición; instancia única en el factory |
| Confiar en `remoteip` sin proxy config | Si estás detrás de un proxy, `req.ip` puede ser el IP del proxy; revisa `trust proxy` |

### Checklist final de integración

- [ ] Llaves en `.env` (+ `.env.example` documentado)
- [ ] Bloque `RECAPTCHA` en `envConfig`
- [ ] `ICaptchaAdapter` + `RecaptchaV2Adapter` + `NoopCaptchaAdapter` + factory
- [ ] Middleware `verifyCaptcha` en la ruta de registro (con Swagger 403)
- [ ] Tests: 400 sin token, 403 fail-closed, 200 happy path
- [ ] Frontend: renderizar widget con `SITE_KEY` y enviar `captchaToken`
- [ ] Marcar `- Validación CAPTCHA.` como implementado en `backlog.md` (línea ~433)

