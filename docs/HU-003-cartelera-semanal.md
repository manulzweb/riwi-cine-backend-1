# HU-003: Visualización de la Cartelera Semanal
## Guía de Estudio de Arquitectura, Flujo y Reglas de Negocio

> **Módulo:** Cartelera & Películas  
> **Archivos Involucrados:**  
> - Ruta: [`app/src/routes/movie.routes.ts`](../app/src/routes/movie.routes.ts)  
> - Controlador: [`app/src/controllers/movie.controller.ts`](../app/src/controllers/movie.controller.ts)  
> - Servicio: [`app/src/services/movie.service.ts`](../app/src/services/movie.service.ts)  
> - Repositorio: [`app/src/repositories/movie.repository.ts`](../app/src/repositories/movie.repository.ts)  
> - Modelos: `Movie`, `CinemaFunction`, `Room`, `Cinema`, `Format`

---

## 1. Escenario Real Paso a Paso

Imaginemos un usuario que entra a la página del cine el **lunes a las 10:00 AM** para ver qué películas hay programadas en su ciudad (Medellín, `cityId: 1`):

1. **Paso 1 (Petición HTTP):** El navegador del cliente dispara `GET /api/v1/movies/weekly?cityId=1`.
2. **Paso 2 (Controller):** `MovieController.getWeeklyMovies` extrae `req.query.cityId`, valida que sea un entero positivo y delega a `MovieService`.
3. **Paso 3 (Cálculo Temporal en Service):** `MovieService` y `MovieRepository` calculan la ventana exacta de 7 días:
   - `startDate`: lunes a las `00:00:00.000`.
   - `endDate`: siguiente domingo a las `23:59:59.999`.
4. **Paso 4 (Query Sequelize en Repository):** El repositorio ejecuta una consulta con `INNER JOIN` (`required: true`) entre `Movie` y `CinemaFunction`:
   - Filtra películas activas (`is_active = true`).
   - Filtra funciones cuya hora de inicio esté entre `[startDate, endDate]`.
   - Filtra salas pertenecientes a cines de la ciudad `cityId: 1`.
5. **Paso 5 (Respuesta Estandarizada):** El middleware de envoltura (`envelopeMiddleware`) responde con HTTP 200:
   ```json
   {
     "success": true,
     "data": [
       {
         "id": 10,
         "title": "Duna: Parte 3",
         "duration": 165,
         "functions": [ ... ]
       }
     ]
   }
   ```

---

## 2. Reglas de Negocio (RN) y Dónde se Aplican en el Código

### RN-010: Exclusividad de Funciones y Películas Activas
* **Explicación:** Un cine puede tener películas registradas en base de datos que ya salieron de cartelera o funciones suspendidas por mantenimiento de sala. Estas **nunca** deben mostrarse al público.
* **Dónde se aplica:** En [`MovieRepository.findWeekly`](../app/src/repositories/movie.repository.ts#L141-L154):
  ```typescript
  where: { isActive: true },
  include: [{
    model: CinemaFunction,
    as: 'functions',
    where: { isActive: true, ... },
    required: true // INNER JOIN: descarta películas que no tengan funciones activas
  }]
  ```

### RN-011: Filtro de Disponibilidad ("Solo con sillas libres")
* **Explicación:** Cuando el usuario activa el checkbox `"Disponible"` en la interfaz (`available: true`), la API debe excluir aquellas funciones cuyas sillas estén 100% vendidas o bloqueadas.
* **Dónde se aplica:** En [`MovieRepository.findByFilters`](../app/src/repositories/movie.repository.ts#L186-L200) y `buildFunctionWhereClause`, comparando la capacidad de la sala con los asientos reservados.

### RN-012: Ventana Estricta de Siete (7) Días Consecutivos
* **Explicación:** La cartelera semanal no muestra "toda la programación futura"; proyecta exactamente 7 días calendario a partir del momento de la consulta.
* **Dónde se aplica:** En [`MovieRepository.findWeekly`](../app/src/repositories/movie.repository.ts#L133-L155):
  ```typescript
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const in7Days = new Date(today);
  in7Days.setDate(today.getDate() + 7);
  in7Days.setHours(23, 59, 59, 999);

  // Filtro Sequelize:
  startTime: { [Op.between]: [today, in7Days] }
  ```

### RN-014: Exclusión de Funciones Pasadas
* **Explicación:** Si son las 4:00 PM, no tiene sentido que la cartelera de hoy muestre una función de las 2:00 PM.
* **Dónde se aplica:** En `findToday()`, el filtro temporal valida que las funciones del día no hayan comenzado antes de la hora actual de corte.

---

## 3. La Consulta SQL Detrás de Escenas (PostgreSQL)

Cuando ejecutas `GET /api/v1/movies/weekly?cityId=1`, Sequelize genera la siguiente consulta relacional optimizada:

```sql
SELECT 
    "Movie"."id",
    "Movie"."title",
    "Movie"."synopsis",
    "Movie"."duration",
    "Movie"."director",
    "Movie"."poster_url",
    "functions"."id" AS "functions.id",
    "functions"."start_time" AS "functions.startTime",
    "functions"."price" AS "functions.price",
    "functions"."format" AS "functions.format"
FROM "movies" AS "Movie"
INNER JOIN "functions" AS "functions" 
    ON "Movie"."id" = "functions"."movie_id" 
    AND "functions"."is_active" = true 
    AND "functions"."start_time" BETWEEN '2026-09-11 00:00:00.000 +00:00' 
                                     AND '2026-09-18 23:59:59.999 +00:00'
WHERE "Movie"."is_active" = true;
```

> **Detalle Senior:** El uso de `required: true` en el `include` de Sequelize es fundamental: transforma un `LEFT OUTER JOIN` en un `INNER JOIN`. Si fuera `LEFT JOIN`, una película activa pero sin funciones programadas aparecería en la cartelera semanal con un arreglo de funciones vacío `functions: []`. Con `INNER JOIN`, solo aparecen películas que realmente tienen funciones disponibles.

---

## 4. Endpoints y Contratos de Datos

### GET `/api/v1/movies/weekly`
* **Query Params:**
  * `cityId` *(number, opcional)*: Identificador de la ciudad.
* **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Duna: Parte 3",
      "synopsis": "Paul Atreides consolida su dominio en Arrakis...",
      "duration": 165,
      "director": "Denis Villeneuve",
      "isActive": true,
      "functions": [
        {
          "id": 14,
          "movieId": 1,
          "startTime": "2026-09-12T18:30:00.000Z",
          "price": 15000,
          "format": "IMAX"
        }
      ]
    }
  ]
}
```

### GET `/api/v1/movies/filter`
* **Query Params Multicriterio:**
  * `date`: `YYYY-MM-DD` (Valida formato ISO con regex en el Service).
  * `genre`: ej. `Acción`, `Ciencia Ficción`.
  * `format`: ej. `2D`, `3D`, `IMAX`.
  * `available`: `true` | `false` (Aplica RN-011).
  * `cinemaId`: ID específico de un multiplex.

---

## 5. Casos Límite y Manejo de Errores

1. **Fecha malformada en filtro (`date=2026-13-45`):**
   * El Service intercepta con `ISO_DATE_REGEX`:
   * Lanza `InvalidMovieDateFilterError`.
   * El `errorHandler` centralizado responde con HTTP 400:
     ```json
     { "success": false, "error": "El formato de fecha es inválido. Use YYYY-MM-DD." }
     ```
2. **Ciudad sin cines registrados (`cityId=999`):**
   * El repositorio retorna un arreglo vacío `[]` con HTTP 200 (no 500 ni 404), indicando limpiamente que no hay programación para esa plaza.
