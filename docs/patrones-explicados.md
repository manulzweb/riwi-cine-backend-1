# Patrones de Diseño Explicados para Juniors — Riwi Cine Backend

> **Para quién:** juniors que ya respetan `Controller → Service → Repository → DB` (HU-001 `backlog.md:63`).  
> **Objetivo:** entender **qué problema resuelve cada patrón**, **dónde vive hoy en tu código** y **cómo quedaría** si lo aplicas.  
> **Regla de oro:** ningún patrón es obligatorio ahora. Se aplican solo cuando veas el `if` repetido, el `throw new Error('texto')` que el front no distingue, o la transacción que se queda a medias. Primero deja `develop` verde con `npm run qa`.

---

## Tabla rápida — ¿qué miro primero?

| Patrón | ¿Cuándo te duele? | ¿Dónde duele hoy? | ¿Qué HU lo pide? |
|---|---|---|---|
| **1. Domain Errors** | Front recibe siempre `400` y no sabe si es `email existe (409)` o `token expiró (410)` | `auth.service.ts:340` `throw new Error` vs `auth.controller.ts:145` `instanceof` bien hecho | HU-006/007/010 |
| **2. Unit of Work** | 2 writes y uno falla → DB a medias (ej: login invalida refresh pero no crea nuevo) | `auth.service.ts:653` `revokeAll` + `create` sin `transaction` | HU-007 RN-030, HU-010 RN-039 |
| **3. Strategy** | `if (formato===VIP) precio*=1.5` repetido por todos lados | `movie.service.ts:1` ignora `SeatType.priceFactor` (HU-009 RN-037) | HU-011 RN-047, HU-019 Cine Flash |
| **4. Specification** | Filtros `?genre=Acción&format=IMAX&available=true` armados a mano en cada query | `movie.controller.ts:529` `req.query.date as string` + `movie.service.ts` | HU-003 |
| **5. Policy** | `if (user.rol !== admin && reserva.userId !== user.id)` copiado en 3 controllers | `auth.middleware.ts:24` `allowedRoles.includes` | HU-020 RBAC, HU-010 RN-042 |
| **6. Factory** | `new Date(Date.now()+10*60*1000)` y `generateMembershipCode()` copiados | `auth.service.ts:332` loop 3 intentos + `crypto.util.ts:19` | HU-006 RN-026, HU-010 |
| **7. State** | `status = 'EXPIRED'` nunca se escribe pero existe en enum | `reservation.model.ts` (futuro) | HU-010 |
| **8. Observer** | `sendActivationEmail()` pegado al final del service, si falla no reintenta | `auth.service.ts:443` `try { sendActivationEmail } catch` | HU-015 |

---

## 1. Domain Errors — que el front entienda qué pasó

### Problema real
Hoy `auth.controller.ts:145` hace bien:
```ts
if (e instanceof EmailAlreadyExistsError) res.status(409).json(...)
```
Pero en `auth.service.ts:340` hay:
```ts
throw new Error('No se pudo generar un código único de membresía')
```
El controller no puede hacer `instanceof` con texto, todo cae a `500`. Lo mismo pasaría con sillas: `throw new Error('silla ocupada')` siempre `400`.

### Solución patrón
Crea errores con nombre, no con texto:
```ts
// app/src/errors/domain-errors.ts:1
export class SeatAlreadyReservedError extends DomainError { status = 409 }
export class FunctionNotFoundError extends DomainError { status = 404 }
```
Service lanza objeto tipado:
```ts
// app/src/services/reservation.service.ts (futuro)
if (ocupada) throw new SeatAlreadyReservedError(seatId)
```
Controller mapea sin leer texto:
```ts
// app/src/controllers/reservation.controller.ts (futuro)
if (e instanceof SeatAlreadyReservedError) return res.status(409).json({message: e.message})
if (e instanceof FunctionNotFoundError) return res.status(404).json(...)
```
**Analogía:** como códigos HTTP pero en tu dominio. El front puede mostrar “elige otra silla” solo con `409`.

**¿Cuándo aplicarlo?** En el próximo `lock-seats` HU-010. No reescribas todo `auth` ahora.

---

## 2. Unit of Work — que todo pase o nada pase

### Problema real
`auth.service.ts:285` `sequelize.transaction(persistRegistration)` está perfecto: 8 tablas o ninguna. Pero `auth.service.ts:653` hace:
```ts
await refreshTokenRepository.revokeAllByUserId(userId) // 1
await refreshTokenRepository.create({...})             // 2 sin transaction
```
Si `create` falla, el usuario queda sin refresh.

### Solución patrón
Un `UnitOfWork` es un “paréntesis transaccional”:
```ts
await unitOfWork.run(async (tx) => {
  await refreshTokenRepository.revokeAllByUserId(userId, tx)
  await refreshTokenRepository.create({userId, tokenHash}, tx)
})
```
Si algo falla, Sequelize hace rollback solo. Para `HU-010` con `SERIALIZABLE` añade retry:
```ts
try { await tx } catch(e){ if(e.code==='40001') retry }
```
**Analogía:** como transferencia bancaria: debitar y acreditar deben ir juntas.

**¿Cuándo?** Cuando toques `lockSeats` (reserva + asientos + expiración). Copia el estilo de `auth.service.ts:285`.

---

## 3. Strategy — no llenes de `if` el cálculo de precio

### Problema real
HU-009 RN-037 dice “precio varía por formato/sala/horario”. Si haces:
```ts
let precio = funcion.precio
if (asiento.tipo === 'VIP') precio *= 1.5
if (asiento.tipo === 'IMAX') precio *= 1.3
if (usuario.membresia === 'Oro') precio *= 0.9
```
Cada promo nueva toca el mismo `if`.

### Solución patrón
```ts
// app/src/services/pricing/discount.strategy.ts:1
interface DiscountStrategy { calculate(cart: Cart): number }
class MembershipDiscount implements DiscountStrategy { calculate(c){ return c.total * 0.9 } }
class CineFlashStrategy implements DiscountStrategy { calculate(c){ return c.total * 0.8 } } // HU-019

// app/src/services/cart.service.ts (futuro)
const strategies = [new MembershipDiscount(), new CineFlashStrategy()]
const total = strategies.reduce((t,s)=> t - s.calculate(cart), base)
```
**Analogía:** como enchufes intercambiables. Añades `BlackFridayStrategy` sin tocar `cart.service.ts`.

**¿Cuándo?** En HU-011 carrito y HU-019 Cine Flash. Hoy no lo necesitas.

---

## 4. Specification — no repitas filtros

### Problema real
`movie.controller.ts:529` arma filtros a mano:
```ts
const filters = { date: req.query.date as string, genre: req.query.genre as string }
```
Cada endpoint (`/weekly`, `/today`, `/filter`) copia el mismo `WHERE`.

### Solución patrón
```ts
// app/src/repositories/specifications/movie.specification.ts:1
class MovieSpecification {
  constructor(private f: FilterMoviesDto){}
  toWhere(){ return { ...(this.f.genre && {genre: this.f.genre}), ...(this.f.available && {available:true}) } }
}
// repository
Movie.findAll({ where: new MovieSpecification(filters).toWhere() })
```
**Analogía:** como filtro de Excel guardado.

**¿Cuándo?** Cuando HU-003 filtros crezcan (fecha+género+idioma+sala).

---

## 5. Policy — saca el “¿puede hacer esto?” del controller

### Problema real
`auth.middleware.ts:24` `allowedRoles.includes(decoded.role)` está bien para roles, pero HU-010 RN-042 “silla movilidad reducida solo para quien la necesita” y HU-016 “cambio solo 1h antes” acabarían como `if` en controller.

### Solución patrón
```ts
// app/src/policies/reservation.policy.ts:1
canRelease(user, reservation){ return reservation.userId===user.id && reservation.expiresAt > now }
canBookReducedMobility(user, seat){ return seat.type==='REDUCIDA' ? user.needsReducedMobility : true }
```
Controller queda limpio:
```ts
if (!reservationPolicy.canRelease(req.user, reservation)) return res.status(403).json(...)
```
**Analogía:** portero que decide, no el camarero.

---

## 6. Factory — no repitas cómo nace un objeto

### Problema real
`auth.service.ts:332` crea membresía con loop 3 intentos para `code` único. `Date.now()+10*60*1000` para expiración de reserva se repetirá en HU-010.

### Solución patrón
```ts
// app/src/factories/reservation.factory.ts:1
ReservationFactory.createActive(userId, functionId){
  return { userId, functionId, expiresAt: new Date(Date.now()+10*60*1000), status:'ACTIVE' }
}
```
**Analogía:** molde de galletas, no amasar a mano cada vez.

---

## 7. State — que el estado no se cambie a lo loco

### Problema real
Futuro `ReservationStatus = ACTIVE|EXPIRED|RELEASED|CONFIRMED`. Hoy `EXPIRED` existe pero nunca se escribe; `releaseExpiredReservations` hace `findAll+for` sin `WHERE status=ACTIVE`.

### Solución patrón
```ts
reservation.release() // solo si status===ACTIVE, si no throw
reservation.confirm() // solo si ACTIVE y no expiró
```
Beneficio: no liberas una reserva ya `CONFIRMED`.

---

## 8. Observer — desacopla “pasó algo” de “qué hago después”

### Problema real
`auth.service.ts:443` `sendActivationEmail` está pegado al final del registro. Si añades SMS, auditoría, puntos, el service crece.

### Solución patrón
```ts
eventBus.publish(new UserRegisteredEvent(userId, emailToken))
// otro archivo
eventBus.on(UserRegisteredEvent, (e)=> sendActivationEmail(e.email, e.token))
eventBus.on(UserRegisteredEvent, (e)=> audit.log(e))
```
Beneficio: `AuthService` no conoce mail ni audit. Útil para HU-015 (recordatorio 24h/2h antes).

**No lo hagas aún** — deja `try/catch` simple hasta tener `UnitOfWork`.

---

## ¿Qué NO hacer ahora?

* **CQRS / EventSourcing / Microservicios / DI Container** — `docs/design-patterns.md:156` y `backlog.md:63` dicen consolidar `Controller→Service→Repository` primero. Con 54 tests y `npm run qa` verde, ya vas bien.

## Checklist para tu próximo PR (copia/pega)

- [ ] ¿Mi `Service` lanza `DomainError` tipado y mi `Controller` hace `instanceof → status`? (ver `auth.controller.ts:145`)
- [ ] ¿Mis 2+ writes van en `sequelize.transaction` con retry si es `SERIALIZABLE`? (ver `auth.service.ts:285`)
- [ ] ¿Evité `if (tipo===VIP)` y pensé en `Strategy` si hay >2 variantes?
- [ ] ¿Mis filtros están en un `Specification` y no copiados?
- [ ] ¿Mi `if (puedeHacer)` está en `policies/*.ts` y no en controller?
- [ ] ¿Mi archivo empieza con `// app/src/...`? (`npm run qa:headers` lo exige)

> Dudas: lee `app/src/services/city.service.ts:10` (Service limpio) y `app/src/controllers/city.controller.ts:26` (Controller con banner). Son tu plantilla en `develop`.
