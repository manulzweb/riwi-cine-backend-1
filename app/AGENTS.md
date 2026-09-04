# Guía de Arquitectura — Patrón Container → Controller → Service → Repository

> Patrón obligatorio para toda nueva entidad (ej. `user`, `city`, `country`, `department`). Basado en `HU-02` y estandarizado en la rama `HU-011/carlos-charris`.

## Stack

Node.js + Express + TypeScript (ESM `nodenext`) + Sequelize + PostgreSQL + `asyncHandler`

## Regla de Oro

**Nunca importar singleton `export default new Service()`.** Toda capa exporta **clase** y se instancia únicamente en `src/containers/*.container.ts` vía **Dependency Injection (DI)** con interfaces.

```
Cliente HTTP
  │
Container (wiring)
  │
Controller (HTTP only) → Service (reglas de negocio) → Repository (Sequelize only) → PostgreSQL
```

## 1. Repository — `src/repositories/*.repository.ts`

```ts
// app/src/repositories/city.repository.ts
import City from '../models/city.model.js';
import { ICityRepository } from './interfaces/city.repository.interface.js';

class CityRepository implements ICityRepository {
  async findById(id: number): Promise<City | null> {
    return City.findByPk(id);
  }
  async findByDepartmentId(departmentId: number): Promise<City[]> {
    /* solo Sequelize */
  }
}
export default CityRepository; // ← CLASE, nunca `new`
```

Interface en `src/repositories/interfaces/*.interface.ts`. Única capa que toca Sequelize.

## 2. Service — `src/services/*.service.ts`

```ts
// app/src/services/city.service.ts
import City from '../models/city.model.js';
import { ICityService } from './interfaces/city.service.interface.js';
import { ICityRepository } from '../repositories/interfaces/city.repository.interface.js';

class CityService implements ICityService {
  constructor(private readonly cityRepository: ICityRepository) {
    this.cityRepository = cityRepository; // estilo explícito de user.service.ts:50-56
  }
  async findByDepartmentId(id: number): Promise<City[]> {
    return this.cityRepository.findByDepartmentId(id); // delega, no hace SQL directo
  }
}
export default CityService;
```

- Implementa `I*Service`, recibe `I*Repository` en constructor.
- JSDoc con Responsabilidades + `@business` + `@implements`.
- No importa `repository` singleton.

## 3. Controller — `src/controllers/*.controller.ts`

```ts
// app/src/controllers/city.controller.ts
import { Request, Response } from 'express';
import { ICityService } from '../services/interfaces/city.service.interface.js';
import { asyncHandler } from '../middleware/async-handler.js';

export class CityController {
  constructor(private readonly cityService: ICityService) {}
  public getCities = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = Number.parseInt(req.params.departmentId, 10);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: 'ID inválido.' });
      return;
    }
    const data = await this.cityService.findByDepartmentId(id);
    res.status(200).json(data);
  });
}
```

- `export class *Controller` con constructor `I*Service`.
- Métodos como arrow `public foo = asyncHandler(async (req,res)=>{})` para preservar `this`.
- Solo: parsear params/body, llamar service, responder `200/400/500`. Nada de reglas ni Sequelize.
- Header con bloque de Arquitectura (ver `src/controllers/user.controller.ts:9-47`).

## 4. Container — `src/containers/*.container.ts`

```ts
// app/src/containers/city.container.ts
import { CityController } from '../controllers/city.controller.js';
import CityRepository from '../repositories/city.repository.js';
import CityService from '../services/city.service.js';

const cityRepository = new CityRepository();
const cityService = new CityService(cityRepository);
export const cityController = new CityController(cityService);
```

Ver referencia completa `src/containers/user.container.ts:1-26` (6 repos para `UserService`). **Único lugar con `new`**.

## 5. Routes — `src/routes/*.routes.ts`

```ts
// app/src/routes/city.routes.ts
import { Router } from 'express';
import { cityController } from '../containers/city.container.js';
const router = Router();
router.get('/:departmentId', cityController.getCities);
export default router;
```

- Importa **controller del container**, no del controller directo.
- Mantener Swagger JSDoc. Registrar en `src/routes/index.ts`.

## 6. Interfaces

- `src/repositories/interfaces/*` y `src/services/interfaces/*` son contratos. Services y Controllers dependen de interfaces, no de clases concretas → testeable con `vi.fn()`.

## 7. Checklist para nueva entidad `Foo`

1. Modelo + `IFooRepository` + `FooRepository` (clase)
2. `IFooService` + `FooService` (clase DI)
3. `FooController` (clase DI + asyncHandler)
4. `src/containers/foo.container.ts`
5. `src/routes/foo.routes.ts` usando container
6. Registrar en `src/routes/index.ts`
7. `npm run lint && npm run build`

## Anti-patrones prohibidos

- `export default new Service()` / `import service from '../services/foo.service.js'`
- Controller con `try/catch` manual (usar `asyncHandler`)
- Service con `import { Op } from 'sequelize'` o `Model.findAll`
- Repository sin interface
- Routes con `import { getFoo } from '../controllers/foo.controller.js'`

## Referencias Canónicas

- `src/controllers/user.controller.ts:49` / `src/services/user.service.ts:42` / `src/containers/user.container.ts:1` / `src/routes/user.routes.ts:15`
- `src/controllers/city.controller.ts:47` / `src/services/city.service.ts:27` / `src/containers/city.container.ts:1` (ejemplo mínimo HU-02)
