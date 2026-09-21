# Guía de Estudio Técnica: HU-003, HU-007 y HU-008
## Proyecto: MultiCine Riwi Backend (Node.js + Express + TypeScript + PostgreSQL)

> Documento de estudio, preparación y sustentación técnica. Relaciona los requerimientos funcionales del Backlog con la arquitectura en capas (Container → Controller → Service → Repository).

---

## Tabla de Contenidos
1. [Arquitectura Base y Convenciones](#arquitectura-base-y-convenciones)
2. [HU-003: Visualización de la Cartelera Semanal](#hu-003-visualización-de-la-cartelera-semanal)
   - [Ficha Técnica](#ficha-técnica-hu-003)
   - [Reglas de Negocio (RN)](#reglas-de-negocio-hu-003)
   - [Endpoints y Parámetros](#endpoints-y-parámetros-hu-003)
   - [Flujo y Detalle en Código](#flujo-y-detalle-en-código-hu-003)
3. [HU-007: Inicio de Sesión y Autenticación Segura](#hu-007-inicio-de-sesión-y-autenticación-segura)
   - [Ficha Técnica](#ficha-técnica-hu-007)
   - [Reglas de Negocio (RN)](#reglas-de-negocio-hu-007)
   - [Estrategia de Seguridad Criptográfica](#estrategia-de-seguridad-criptográfica)
   - [Endpoints y Ciclo de Vida de Tokens](#endpoints-y-ciclo-de-vida-de-tokens-hu-007)
   - [Flujo y Detalle en Código](#flujo-y-detalle-en-código-hu-007)
4. [HU-008: Consulta de Perfil y Beneficios de Membresía](#hu-008-consulta-de-perfil-y-beneficios-de-membresía)
   - [Ficha Técnica](#ficha-técnica-hu-008)
   - [Reglas de Negocio (RN)](#reglas-de-negocio-hu-008)
   - [Matriz de Niveles y Descuentos](#matriz-de-niveles-y-descuentos)
   - [Generación del Código QR](#generación-del-código-qr-rn-033)
   - [Endpoints y Detalle en Código](#endpoints-y-detalle-en-código-hu-008)
5. [Matriz Comparativa de las Tres Historias](#matriz-comparativa-de-las-tres-historias)
6. [Banco de Preguntas para Sustentación / Code Review](#banco-de-preguntas-para-sustentación--code-review)

---

## Arquitectura Base y Convenciones

Toda la aplicación sigue rigurosamente el patrón de diseño desacoplado mediante Inyección de Dependencias (DI):

```
Petición HTTP
     │
[ Container ]      → Wiring único con 'new' inyectando repositorios en servicios
     │
[ Controller ]     → Valida params/body, llama al Service y responde (asyncHandler)
     │
[ Service ]        → Reglas de negocio puras, agnóstico de Express y Sequelize
     │
[ Repository ]     → Consultas Sequelize directas al motor PostgreSQL
     │
PostgreSQL
```

* **Middlewares Globales:**
  * `envelopeMiddleware`: Envuelve todas las respuestas en `{ success: true, data: ... }` o `{ success: false, error: ... }`.
  * `errorHandler`: Maneja excepciones tipadas de negocio (HTTP 400, 401, 403, 404, 409) y captura errores 500 no controlados.

---

## HU-003: Visualización de la Cartelera Semanal

### Ficha Técnica HU-003
* **Épica:** Cartelera
* **Sprint:** 1
* **Prioridad:** Muy Alta
* **Historia de Usuario:**
  > **Como** visitante  
  > **Quiero** visualizar toda la cartelera semanal  
  > **Para** elegir la mejor película y horario disponible en mi ciudad.

### Reglas de Negocio (HU-003)
* **RN-010 (Funciones Activas):** Solo deben mostrarse películas y funciones que tengan `isActive = true`.
* **RN-011 (Filtro Disponible):** Si el usuario filtra por "Disponible", no deben listarse funciones cuyas sillas estén agotadas (`soldSeatsCount >= totalSeats`).
* **RN-012 (Ventana de 7 Días):** La cartelera semanal siempre proyecta exactamente **7 días consecutivos** a partir del día actual (`[fechaActual, fechaActual + 6 días]`).
* **RN-013 (Sincronización):** Si se programa una nueva función o se cancela una sala, la respuesta de la API refleja el cambio inmediatamente.
* **RN-014 (Funciones Futuras):** Se excluyen funciones con hora ya transcurrida respecto a la hora del servidor.

### Endpoints y Parámetros (HU-003)

| Método | Ruta | Query Params | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/movies` | `none` | Catálogo maestro de películas activas. |
| `GET` | `/api/v1/movies/weekly` | `cityId` *(opcional)* | Cartelera de los próximos 7 días filtrada por ciudad. |
| `GET` | `/api/v1/movies/today` | `cityId` *(opcional)* | Funciones programadas exclusivamente para el día de hoy. |
| `GET` | `/api/v1/movies/filter` | `cityId`, `date`, `genre`, `rating`, `language`, `format`, `cinemaId` | Búsqueda multicriterio avanzada. |

### Flujo y Detalle en Código (HU-003)

* **Archivos:**
  * Controller: `src/controllers/movie.controller.ts`
  * Service: `src/services/movie.service.ts`
  * Repository: `src/repositories/movie.repository.ts`
  * Modelo: `src/models/movie.model.ts`, `src/models/function.model.ts`

```typescript
// Lógica de cálculo de los 7 días en MovieService:
const startDate = new Date();
const endDate = new Date();
endDate.setDate(startDate.getDate() + 6);
endDate.setHours(23, 59, 59, 999);

// El Repository aplica el rango en Sequelize:
where: {
  isActive: true,
  date: { [Op.between]: [startDateStr, endDateStr] }
}
```

---

## HU-007: Inicio de Sesión y Autenticación Segura

### Ficha Técnica HU-007
* **Épica:** Seguridad
* **Sprint:** 2
* **Prioridad:** Crítica
* **Historia de Usuario:**
  > **Como** usuario registrado  
  > **Quiero** iniciar sesión de forma segura  
  > **Para** acceder a mis beneficios, compras y reservas.

### Reglas de Negocio (HU-007)
* **RN-027 (Bloqueo por Fuerza Bruta):** Tras **5 intentos fallidos** consecutivos de contraseña, la cuenta se bloquea automáticamente por **15 minutos** (`failedLoginAttempts >= 5` → `lockedUntil = now + 15 min`).
* **RN-028 (Vigencia Access Token):** El Access Token JWT tiene una duración de **15 minutos** (`JWT_ACCESS_EXPIRES_IN = '15m'`).
* **RN-029 (Vigencia Refresh Token):** El Refresh Token tiene una duración de **7 días** (`JWT_REFRESH_EXPIRES_IN = '7d'`) y se almacena en la tabla `refresh_tokens`.
* **RN-030 (Rotación de Tokens):** Cada nuevo login o refresco invalida el Refresh Token anterior para prevenir ataques de repetición (*Replay Attacks*).
* **RN-031 (Verificación Obligatoria):** Solo usuarios con cuenta activa y correo verificado (`isActive = true`) pueden iniciar sesión.

### Estrategia de Seguridad Criptográfica

1. **Bcrypt con factor de costo configurable:**
   * Las contraseñas se almacenan mediante `bcrypt.hash(password, 12)`.
2. **Mitigación de Timing Attacks (`dummyVerify`):**
   * *Problema:* Si el usuario no existe y el servidor responde de inmediato en 2 ms, pero cuando existe tarda 150 ms verificando la contraseña, un atacante puede deducir qué correos existen en la base de datos (User Enumeration).
   * *Solución implementada:* Si el usuario no existe (`!user`), `PasswordService.dummyVerify()` ejecuta un hash falso con el mismo costo (`BCRYPT_ROUNDS = 12`) garantizando tiempo de respuesta constante e indistinguible.
3. **Auditoría de Inicios de Sesión:**
   * Todo intento (éxito, contraseña errónea, usuario no encontrado, cuenta bloqueada) registra IP y User-Agent en `login_audits`.

### Endpoints y Ciclo de Vida de Tokens (HU-007)

```
[ Cliente ] ──── POST /auth/login { email, password } ────► [ AuthService ]
     │                                                               │
     ◄─── { accessToken (15m), refreshToken (7d), user, membership } ┘
     │
 (15 minutos después...)
     │
     ├──── Request con Access Token expirado ──► 401 Unauthorized
     │
     └──── POST /auth/refresh { refreshToken } ──► [ TokenService ]
                 │                                        │
                 ▼                                        ▼
           Invalida Token Anterior               Genera Nuevo Par
                 │                                        │
                 ◄─────── { newAccessToken, newRefreshToken } ────┘
```

| Endpoint | Parámetros Body | Respuesta Exitosa | Códigos de Error |
| :--- | :--- | :--- | :--- |
| `POST /auth/login` | `email`, `password` | `accessToken`, `refreshToken`, `user`, `membership` | `401` (Inválido), `403` (Bloqueado/Inactivo) |
| `POST /auth/refresh` | `refreshToken` | `accessToken`, `refreshToken` | `401` (Expirado/Inválido) |
| `POST /auth/logout` | `refreshToken` | `{ message: 'Sesión cerrada correctamente' }` | `400` |
| `POST /auth/forgot-password` | `email` | `{ message: 'Correo de recuperación enviado' }` | `200` (silencioso anti-enumeración) |
| `POST /auth/reset-password` | `token`, `newPassword` | `{ message: 'Contraseña actualizada' }` | `400` (Token inválido/expirado) |

---

## HU-008: Consulta de Perfil y Beneficios de Membresía

### Ficha Técnica HU-008
* **Épica:** Membresía Digital
* **Sprint:** 2
* **Prioridad:** Alta
* **Historia de Usuario:**
  > **Como** usuario autenticado  
  > **Quiero** consultar mi perfil y los beneficios asociados a mi membresía  
  > **Para** conocer mis descuentos y ventajas antes de comprar.

### Reglas de Negocio (HU-008)
* **RN-032 (Escala de Descuentos por Nivel):**
  * **BÁSICA:** 0% de descuento en boletería.
  * **ESTÁNDAR:** 5% de descuento (requiere acumular 300 puntos).
  * **PREMIUM:** 10% de descuento (requiere acumular 800 puntos).
* **RN-033 (Código QR Intransferible):**
  * Cada membresía posee un código único (ej. `MEM-A1B2C3D4`).
  * El backend genera dinámicamente el código QR en Base64 (`data:image/png;base64,...`) usando la librería `qrcode` para ser escaneado en taquillas.
* **RN-034 (Seguridad en Cambio de Correo):**
  * Si el usuario actualiza su email desde el perfil, la cuenta vuelve al estado inactivo (`isActive = false`) y se despacha un nuevo correo de validación.

### Matriz de Niveles y Descuentos

```typescript
export const LEVEL_POINTS_REQUIREMENTS = {
  BÁSICA:   { nextLevel: 'ESTÁNDAR', pointsRequired: 300, discountPercentage: 0 },
  ESTÁNDAR: { nextLevel: 'PREMIUM',  pointsRequired: 800, discountPercentage: 5 },
  PREMIUM:  { nextLevel: 'PREMIUM',  pointsRequired: 800, discountPercentage: 10 },
};
```

### Generación del Código QR (RN-033)

El servicio `ProfileService` y `MembershipService` no guardan imágenes pesadas en el disco; generan el Data URL en memoria bajo demanda:

```typescript
const qrCodeDataUrl = await QRCode.toDataURL(membership.code, {
  errorCorrectionLevel: 'M',
  width: 300,
  margin: 2,
});
```

### Endpoints y Detalle en Código (HU-008)

Todos estos endpoints requieren encabezado `Authorization: Bearer <accessToken>`.

| Método | Endpoint | Respuesta / Propósito |
| :--- | :--- | :--- |
| `GET` | `/api/v1/profile` | Datos personales, preferencias de notificación, saldo de billetera y código QR en Base64. |
| `PUT` | `/api/v1/profile` | Actualiza teléfono, nombres, ciudad principal y complejo favorito. |
| `GET` | `/api/v1/membership` | Consulta código, estado (`Activa`), puntos acumulados y nivel actual. |
| `GET` | `/api/v1/membership/benefits` | Desglose de beneficios: porcentaje de descuento activo, puntos faltantes para subir de nivel y saldo de billetera. |

---

## Matriz Comparativa de las Tres Historias

| Dimensión | HU-003 (Cartelera) | HU-007 (Login / Auth) | HU-008 (Perfil / Membresía) |
| :--- | :--- | :--- | :--- |
| **Acceso** | Público (Visitantes) | Público (Formulario Login) | Privado (`authMiddleware` Bearer JWT) |
| **Carga Principal** | Lectura intensiva (`GET`) | Procesamiento criptográfico CPU (`bcrypt`) | Agregación de datos multi-tabla |
| **Modelos BD** | `Movie`, `Function`, `Cinema`, `Room`, `Format` | `User`, `RefreshToken`, `LoginAudit` | `Profile`, `Membership`, `MembershipLevel`, `BonusWallet` |
| **Punto Crítico** | Rango temporal de 7 días y filtros | Anti-fuerza bruta (15 min) y Timing Attacks | Generación de QR Base64 y cálculo de nivel |

---

## Banco de Preguntas para Sustentación / Code Review

### 1. ¿Cómo maneja la HU-003 el desfase de zonas horarias al calcular los 7 días?
> **Respuesta:** En `MovieService`, las fechas se construyen al inicio del día (`00:00:00.000`) y al final del séptimo día (`23:59:59.999`) en formato ISO (`YYYY-MM-DD`). En la base de datos se comparan como fechas completas para garantizar que los usuarios vean exactamente la programación de los próximos 7 días calendario.

### 2. En HU-007, ¿por qué es peligroso usar un simple `setTimeout` para disimular que un usuario no existe?
> **Respuesta:** Porque `setTimeout` no consume CPU, solo duerme la tarea en el event loop. Un atacante midiendo el uso de CPU o enviando ráfagas de peticiones puede diferenciar una llamada falsa (0% CPU) de una llamada legítima con `bcrypt` (100% de CPU). Además, la duración de `bcrypt` fluctúa con la carga del servidor, mientras que un temporizador estático no. Por eso se implementó `passwordService.dummyVerify()`.

### 3. En HU-007, ¿qué sucede si un atacante roba un Refresh Token?
> **Respuesta:** La aplicación implementa **Rotación de Refresh Tokens (RN-030)**. En el momento en que el Refresh Token es utilizado, se invalida inmediatamente y se expide uno nuevo. Si el token robado o el legítimo intentan reutilizarse, el sistema detecta la inconsistencia y rechaza la sesión.

### 4. En HU-008, ¿cómo se asegura que el código QR no sea transferible o falsificable?
> **Respuesta:** El QR solo contiene el `membershipCode` criptográfico único generado con reintentos anti-colisión en el registro (`MEM-XXXXXX`). Para redimir beneficios en taquilla, el sistema valida en tiempo real en la base de datos que la membresía esté en estado `Activa` y pertenezca al usuario titular.
