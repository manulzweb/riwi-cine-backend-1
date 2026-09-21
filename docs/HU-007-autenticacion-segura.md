# HU-007: Inicio de Sesión y Autenticación Segura
## Guía de Estudio de Arquitectura, Criptografía y Reglas de Negocio

> **Módulo:** Seguridad & Autenticación  
> **Archivos Involucrados:**  
> - Ruta: [`app/src/routes/auth.routes.ts`](../app/src/routes/auth.routes.ts)  
> - Controlador: [`app/src/controllers/auth.controller.ts`](../app/src/controllers/auth.controller.ts)  
> - Servicio: [`app/src/services/auth.service.ts`](../app/src/services/auth.service.ts)  
> - Criptografía & Tokens: [`app/src/services/password.service.ts`](../app/src/services/password.service.ts), [`app/src/services/auth-token.service.ts`](../app/src/services/auth-token.service.ts)  
> - Repositorios: `UserRepository`, `RefreshTokenRepository`, `LoginAuditRepository`  
> - Modelos: `User`, `RefreshToken`, `LoginAudit`

---

## 1. Escenario Real Paso a Paso

### Caso A: Login Exitoso
1. **Paso 1 (Petición HTTP):** El cliente envía `POST /api/v1/auth/login` con:
   ```json
   { "email": "carlos@riwicine.com", "password": "Password123!" }
   ```
2. **Paso 2 (Validación de Existencia y Estado):**
   * Se consulta `userRepository.findByEmail("carlos@riwicine.com")`.
   * Se verifica que la cuenta no esté bloqueada (`lockedUntil <= NOW()`, **RN-027**).
   * Se verifica que la cuenta esté activada (`isActive === true`, **RN-031**).
3. **Paso 3 (Verificación Criptográfica):**
   * Se ejecuta `passwordService.verify(password, user.passwordHash)`.
   * Internamente llama a `bcrypt.compare`.
4. **Paso 4 (Reinicio de Intentos Fallidos):**
   * Al ser exitoso, `userRepository.resetFailedAttempts(user.id)` resetea el contador `failedLoginAttempts = 0` y actualiza `lastLoginAt = NOW()`.
5. **Paso 5 (Emisión y Rotación de Tokens - RN-028, RN-029, RN-030):**
   * Genera **Access Token** JWT (duración: 15 minutos).
   * Genera **Refresh Token** criptográfico (duración: 7 días).
   * **Invalida en BD todos los Refresh Tokens anteriores del usuario** (`isRevoked = true`).
   * Guarda el hash SHA-256 del nuevo Refresh Token en la tabla `refresh_tokens`.
6. **Paso 6 (Auditoría):**
   * Registra en `login_audits` el intento con estado `'SUCCESS'`, la IP de origen y el User-Agent.
7. **Paso 7 (Respuesta):**
   * Retorna los tokens junto con la información de membresía y perfil del usuario.

---

### Caso B: Intento Fallido y Bloqueo por Fuerza Bruta (RN-027)

* **Intento 1 al 4 (Contraseña incorrecta):**
  1. `bcrypt.compare` retorna `false`.
  2. `userRepository.incrementFailedAttempts(user.id)` incrementa `failed_login_attempts`.
  3. Se registra en auditoría: `'FAILED_PASSWORD'`.
  4. Se lanza `InvalidCredentialsError` (HTTP 401).
* **Intento 5 (Disparo del Bloqueo):**
  1. Al llegar al intento 5, el servicio calcula:
     ```typescript
     const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
     await this.userRepository.lockAccount(user.id, lockUntil);
     ```
  2. Registra en auditoría: `'ACCOUNT_LOCKED'`.
  3. Lanza `AccountLockedError` (HTTP 403).
  4. Durante los próximos 15 minutos, **cualquier intento de login con ese correo será rechazado de inmediato sin siquiera verificar la contraseña**.

---

### Caso C: El Correo NO Existe (Mitigación de Timing Attack)

Si un atacante prueba con `correo_inexistente@gmail.com`:
1. `userRepository.findByEmail(...)` devuelve `null`.
2. Si el servidor respondiera de inmediato en 2 ms diciendo "Credenciales inválidas", pero cuando el correo sí existe tarda 150 ms verificando la contraseña con bcrypt, el atacante sabría midiendo la latencia qué correos existen en la plataforma.
3. **Mecanismo implementado:**
   ```typescript
   if (!user) {
     await this.passwordService.dummyVerify(password);
     await this.recordAudit('FAILED_USER_NOT_FOUND', email, null, ipAddress, deviceUserAgent);
     throw new InvalidCredentialsError();
   }
   ```
4. `PasswordService.dummyVerify()` ejecuta un hash simulado utilizando exactamente las mismas 12 rondas de bcrypt (`envConfig.BCRYPT.ROUNDS`).
5. **Resultado:** El servidor tarda exactamente los mismos ~150 ms de procesamiento de CPU, imposibilitando los ataques de enumeración de usuarios.

---

## 2. Reglas de Negocio (RN) y Dónde se Aplican en el Código

| Regla | Descripción | Ubicación en Código |
| :--- | :--- | :--- |
| **RN-027** | Máximo 5 intentos fallidos antes de bloquear por 15 min. | [`AuthService.validateUserForLogin`](../app/src/services/auth.service.ts#L493) y `handleFailedPassword` |
| **RN-028** | Access Token con vigencia de 15 minutos. | [`env.ts:63`](../app/src/config/env.ts#L63) (`JWT_ACCESS_EXPIRES_IN = '15m'`) |
| **RN-029** | Refresh Token con vigencia de 7 días. | [`env.ts:64`](../app/src/config/env.ts#L64) (`JWT_REFRESH_EXPIRES_IN = '7d'`) |
| **RN-030** | Cada login invalida el Refresh Token anterior (Rotación). | [`AuthService.issueAndRotateTokens`](../app/src/services/auth.service.ts#L552) (`revokeAllByUserId`) |
| **RN-031** | Solo usuarios activos y verificados pueden iniciar sesión. | [`AuthService.validateUserForLogin`](../app/src/services/auth.service.ts#L498) (`!user.isActive`) |

---

## 3. Seguridad y Criptografía en Detalle

### ¿Por qué Bcrypt con Costo 12?
En [`env.ts`](../app/src/config/env.ts#L68) está configurado `BCRYPT_ROUNDS = 12`.
* Bcrypt usa un algoritmo con factor de costo exponencial ($2^{cost}$).
* Costo 12 significa $2^{12} = 4,096$ iteraciones de hashing.
* En un procesador moderno, toma entre **100 ms y 250 ms**, lo cual es imperceptible para un usuario humano que inicia sesión una vez, pero hace computacionalmente imposible para un atacante realizar millones de pruebas de fuerza bruta por segundo.

### Almacenamiento Seguro del Refresh Token
Un Refresh Token es una credencial de larga duración (7 días). Si se guardara en texto plano en la base de datos y la BD fuera comprometida, los atacantes podrían secuestrar todas las sesiones activas.
* Por eso, en [`AuthService.issueAndRotateTokens`](../app/src/services/auth.service.ts#L556):
  ```typescript
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await this.refreshTokenRepository.create({ userId, tokenHash, expiresAt });
  ```
* En la base de datos **solo se almacena el hash SHA-256**. El token original solo lo posee el cliente en su cookie/storage seguro.

---

## 4. Consultas SQL Detrás de Escenas (PostgreSQL)

### Al bloquear una cuenta por 5 intentos:
```sql
UPDATE "users" 
SET 
    "failed_login_attempts" = "failed_login_attempts" + 1,
    "locked_until" = '2026-09-11 10:15:00.000 +00:00'
WHERE "id" = 42;
```

### Al revocar tokens anteriores durante el login (Token Rotation):
```sql
UPDATE "refresh_tokens" 
SET "is_revoked" = true 
WHERE "user_id" = 42 AND "is_revoked" = false;
```

### Al registrar la auditoría:
```sql
INSERT INTO "login_audits" ("user_id", "email_attempted", "status", "ip_address", "device_user_agent", "created_at")
VALUES (42, 'carlos@riwicine.com', 'SUCCESS', '192.168.1.100', 'Mozilla/5.0...', NOW());
```

---

## 5. Endpoints y Respuestas

### POST `/api/v1/auth/login`
* **Request Body:**
```json
{
  "email": "carlos@riwicine.com",
  "password": "Password123!"
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 42,
      "email": "carlos@riwicine.com",
      "role": "cliente"
    },
    "membership": {
      "code": "MEM-8F2A1C",
      "level": "BÁSICA",
      "points": 0
    }
  }
}
```

### POST `/api/v1/auth/refresh`
* **Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
* **Response 200 OK:** Entrega un nuevo par de Access Token y Refresh Token, revocando el anterior.
