# HU-008: Consulta de Perfil y Beneficios de Membresía
## Guía de Estudio de Arquitectura, Agregados y Reglas de Negocio

> **Módulo:** Membresía Digital & Fidelización  
> **Archivos Involucrados:**  
> - Rutas: [`app/src/routes/profile.routes.ts`](../app/src/routes/profile.routes.ts), [`app/src/routes/membership.routes.ts`](../app/src/routes/membership.routes.ts)  
> - Controladores: [`app/src/controllers/profile.controller.ts`](../app/src/controllers/profile.controller.ts), [`app/src/controllers/membership.controller.ts`](../app/src/controllers/membership.controller.ts)  
> - Servicios: [`app/src/services/profile.service.ts`](../app/src/services/profile.service.ts), [`app/src/services/membership.service.ts`](../app/src/services/membership.service.ts)  
> - Repositorios: `ProfileRepository`, `MembershipRepository`, `BonusWalletRepository`, `NotificationPreferenceRepository`, `CityRepository`, `CinemaRepository`  
> - Modelos: `Profile`, `Membership`, `MembershipLevel`, `MembershipStatus`, `BonusWallet`, `NotificationPreference`

---

## 1. Escenario Real Paso a Paso

### Caso A: El usuario abre "Mi Cuenta" en la App / Web (`GET /api/v1/profile`)

1. **Paso 1 (Autenticación y Extracción de Identidad):**
   * La petición llega con el encabezado `Authorization: Bearer <accessToken>`.
   * El middleware `requireAuth` verifica la firma y expiración del JWT y extrae el `userId = req.user.id`.
2. **Paso 2 (Consolidación del Agregado en `ProfileService`):**
   * En [`ProfileService.getProfile`](../app/src/services/profile.service.ts#L58-L99), el backend orquesta y consolida la información de **5 tablas relacionales distintas**:
     1. `userRepository.findById(userId)`: Email y estado de la cuenta.
     2. `profileRepository.findByUserId(userId)`: Nombres, apellidos, documento, teléfono y ciudad.
     3. `membershipRepository.findByUserIdWithDetails(userId)`: Código único, puntos acumulados, nivel y estado.
     4. `bonusWalletRepository.findByUserId(userId)`: Saldo disponible en billetera de bonos.
     5. `notificationPreferenceRepository.findByUserId(userId)`: Preferencias (email, SMS, push).
3. **Paso 3 (Generación Dinámica del Código QR - RN-033):**
   * El servicio toma el código alfanumérico único de la membresía (`membership.code`, ej. `MEM-9X4K2A`).
   * Utiliza la librería `QRCode.toDataURL(...)` para renderizar en memoria una cadena Base64 (`data:image/png;base64,iVBORw0...`).
   * **Cero escritura en disco:** No satura el servidor de archivos ni requiere almacenar PNGs en AWS S3.
4. **Paso 4 (Respuesta Unificada):**
   * Retorna un DTO limpio estructurado con todo el ecosistema del usuario en una sola llamada HTTP.

---

### Caso B: El cliente escanea su QR en la taquilla del cine (`GET /api/v1/membership/benefits`)

1. El usuario muestra la pantalla de su teléfono con el QR.
2. El lector de taquilla lee el código `MEM-9X4K2A` y el frontend consulta los beneficios activos con `GET /api/v1/membership/benefits`.
3. [`MembershipService.getBenefits`](../app/src/services/membership.service.ts#L125-L168):
   * Verifica que la membresía esté en estado **Activa**.
   * Lee los puntos acumulados (ej. `450 puntos`).
   * Consulta la matriz de niveles (**RN-032**):
     * Determina que el usuario está en nivel **ESTÁNDAR** (≥ 300 puntos).
     * Aplica **5% de descuento** en boletería.
     * Informa que le faltan **350 puntos** para subir a nivel **PREMIUM** (meta de 800 puntos).
   * Retorna el saldo disponible en billetera de bonos para pagar parte de las entradas.

---

## 2. Reglas de Negocio (RN) y Dónde se Aplican en el Código

### RN-032: Escala de Niveles y Descuentos en Boletería
* **Explicación:** La lealtad del cliente se premia con descuentos progresivos que se calculan automáticamente según el nivel activo.
* **Dónde se aplica:** En [`MembershipService`](../app/src/services/membership.service.ts#L21-L28):
  ```typescript
  const LEVEL_POINTS_REQUIREMENTS = {
    [MEMBERSHIP_LEVELS.BASIC]:    { nextLevel: MEMBERSHIP_LEVELS.STANDARD, points: 300, discount: 0 },
    [MEMBERSHIP_LEVELS.STANDARD]: { nextLevel: MEMBERSHIP_LEVELS.PREMIUM,  points: 800, discount: 5 },
    [MEMBERSHIP_LEVELS.PREMIUM]:  { nextLevel: MEMBERSHIP_LEVELS.PREMIUM,  points: 800, discount: 10 },
  };
  ```

### RN-033: Código QR Intransferible y Dinámico
* **Explicación:** Cada membresía posee un código único alfanumérico generado con algoritmo anti-colisión durante el registro (`generateMembershipCode()`).
* **Dónde se aplica:** En [`ProfileService.generateQrCode`](../app/src/services/profile.service.ts#L201-L207):
  ```typescript
  private async generateQrCode(code: string): Promise<string> {
    return await QRCode.toDataURL(code, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
    });
  }
  ```
  *Nivel de corrección de error 'M' (Medium - 15% de recuperación):* Asegura que el código sea legible por lectores de taquilla incluso con pantallas de celular rayadas o con poco brillo.

### RN-034: Reactivación Requerida en Cambio de Correo
* **Explicación:** Si un usuario pudiera cambiar su correo libremente desde su perfil, un atacante con una sesión abierta podría secuestrar la cuenta cambiando el email sin confirmación.
* **Dónde se aplica:** Si se actualiza el email, la cuenta revoca su estado activo (`isActive = false`) y despacha un nuevo correo de activación con token temporal de verificación.

---

## 3. Patrón de Agregado DDD (Domain-Driven Design)

Un error común de diseño en aplicaciones backend es hacer que el frontend realice 5 peticiones HTTP por separado:
* `GET /users/me`
* `GET /profiles/me`
* `GET /memberships/me`
* `GET /wallets/me`
* `GET /notifications/me`

En este proyecto, [`ProfileService`](../app/src/services/profile.service.ts) actúa como el **Root Aggregate**:
* Inyecta mediante Interfaces los 5 repositorios especializados.
* Ensambla en memoria el objeto `ProfileDetailResponseDto`.
* Reduce el consumo de red del cliente a **una sola llamada HTTP rápida y atómica**.

---

## 4. Consultas SQL Detrás de Escenas (PostgreSQL)

Al llamar a `GET /api/v1/profile`, el repositorio ejecuta consultas eficientes con carga ansiosa (*Eager Loading*):

```sql
-- Consulta de la Membresía con sus Catálogos de Nivel y Estado
SELECT 
    "Membership"."id", 
    "Membership"."code", 
    "Membership"."points_balance" AS "pointsBalance",
    "level"."name" AS "level.name",
    "level"."discount_percentage" AS "level.discountPercentage",
    "status"."name" AS "status.name"
FROM "memberships" AS "Membership"
LEFT OUTER JOIN "membership_levels" AS "level" ON "Membership"."level_id" = "level"."id"
LEFT OUTER JOIN "membership_statuses" AS "status" ON "Membership"."status_id" = "status"."id"
WHERE "Membership"."user_id" = 42;

-- Consulta de la Billetera de Bonos
SELECT "balance" FROM "bonus_wallets" WHERE "user_id" = 42;

-- Consulta de Preferencias de Notificación
SELECT "email_enabled", "sms_enabled", "push_enabled" 
FROM "notification_preferences" 
WHERE "user_id" = 42;
```

---

## 5. Endpoints y Respuestas

### GET `/api/v1/profile`
* **Header Requerido:** `Authorization: Bearer <token>`
* **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": 42,
    "email": "carlos@riwicine.com",
    "isActive": true,
    "profile": {
      "firstName": "Carlos",
      "lastName": "Charris",
      "documentType": "CC",
      "documentNumber": "1020304050",
      "birthDate": "1995-04-12T00:00:00.000Z",
      "gender": "M",
      "phone": "+573001234567",
      "cityId": 1,
      "cityName": "Medellín",
      "favoriteCinemaId": 3,
      "favoriteCinemaName": "Multiplex Viva Envigado"
    },
    "membership": {
      "code": "MEM-8F2A1C",
      "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEUAAAD///+l2Z/dAAACDUlEQVR42uybMW7DMAxF...==",
      "level": "ESTÁNDAR",
      "status": "Activa",
      "pointsBalance": 450,
      "discountPercentage": 5
    },
    "bonusWallet": {
      "balance": 25000
    },
    "notificationPreferences": {
      "emailEnabled": true,
      "smsEnabled": false,
      "pushEnabled": true
    }
  }
}
```

### GET `/api/v1/membership/benefits`
* **Header Requerido:** `Authorization: Bearer <token>`
* **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "data": {
    "membershipCode": "MEM-8F2A1C",
    "currentLevel": "ESTÁNDAR",
    "discountPercentage": 5,
    "currentPoints": 450,
    "nextLevel": "PREMIUM",
    "pointsNeededForNextLevel": 350,
    "walletBalance": 25000,
    "benefits": [
      {
        "title": "Descuento en Taquilla",
        "description": "5% de descuento en todas tus boletas 2D, 3D e IMAX.",
        "isActive": true
      }
    ]
  }
}
```
