// app/scripts/postman-documentation.data.mjs
/**
 * ============================================================================
 * Catálogo Oficial de Documentación Técnica para Postman Documenter
 * ============================================================================
 * Provee descripciones exhaustivas en Markdown para:
 * - Visión general de la colección (info.description)
 * - Carpetas por módulo (folder.description)
 * - Cada uno de los 57 endpoints de la API (request.description)
 *
 * Incluye: propósito, reglas de negocio, autenticación, parámetros, cuerpo y
 * estructura del Response Envelope Pattern (success, data, message).
 */

export const collectionOverview = `# MultiCine Riwi Backend API (v1)

Bienvenido a la documentación oficial y de referencia de la API RESTful de **MultiCine Riwi**, desarrollada con Node.js, Express, TypeScript, Sequelize y PostgreSQL.

---

## Estándar de Respuesta Unificado (Response Envelope Pattern)

Todas las respuestas de la API están envueltas de manera estandarizada y predecible:

### Respuestas Exitosas (HTTP 2xx)
\`\`\`json
{
  "success": true,
  "data": { ... },       // Presente en la gran mayoría de endpoints
  "message": "..."       // En acciones de confirmación o mutaciones sin exposición de datos
}
\`\`\`

- **success** *(Obligatorio)*: Booleano \`true\` que certifica la correcta ejecución.
- **data** *(Recurso principal)*: Objeto o array con los datos solicitados.
- **message** *(Confirmación / Seguridad)*: Presente en acciones operativas o de seguridad donde por privacidad no se exponen entidades de base de datos (\`logout\`, \`verify-email\`, \`forgot-password\`, \`reset-password\`, \`release-seats\`).

### Respuestas de Error (HTTP 4xx / 5xx)
\`\`\`json
{
  "success": false,
  "error": "NombreDelError",
  "message": "Descripción clara del motivo del fallo",
  "details": [ ... ]
}
\`\`\`

---

## Autenticación y Seguridad

La API utiliza tokens de acceso **JWT (JSON Web Tokens)** transmitidos mediante la cabecera estándar HTTP:
\`\`\`http
Authorization: Bearer <accessToken>
\`\`\`

- **Access Token**: Vida útil de 15 minutos. Utilizado para autorizar peticiones protegidas.
- **Refresh Token**: Vida útil de 7 días. Utilizado exclusivamente en \`POST /auth/refresh\` y \`POST /auth/logout\`.
- **Auto-Sync en Postman**: Las peticiones de login (\`POST /auth/login\`) y renovación (\`POST /auth/refresh\`) extraen y configuran automáticamente las variables \`{{accessToken}}\` y \`{{refreshToken}}\`.

---

## Entornos Disponibles

| Entorno | Base URL (\`{{baseUrl}}\`) | Propósito |
| :--- | :--- | :--- |
| **Mock Server Oficial** | \`https://c9ae4de7-f186-405e-a663-f9040d3c74a4.mock.pstmn.io\` | Pruebas de integración frontend inmediatas sin requerir backend local |
| **Localhost** | \`http://localhost:3000/api/v1\` | Entorno de desarrollo local con Docker y PostgreSQL |
`;

export const folderDescriptions = {
  Auth: `### Módulo de Autenticación y Control de Sesión
Gestión completa del ciclo de vida de usuarios y credenciales:
- Registro de cuentas con generación de membresía digital inmediata.
- Autenticación segura mediante contraseñas cifradas con bcrypt (12 rounds).
- Emisión y rotación de tokens JWT (Access Token y Refresh Token).
- Verificación de correo electrónico y activación de cuenta.
- Recuperación y restablecimiento seguro de contraseñas.
- Cierre de sesión y revocación de tokens.`,

  Movies: `### Módulo de Películas y Cartelera
Consulta del catálogo de películas activas y programación de exhibición:
- Cartelera semanal (próximos 7 días) geolocalizada por ciudad del usuario.
- Cartelera para el día de hoy con validación de horarios vigentes.
- Búsqueda y filtrado multicriterio (fecha, género, formato 2D/3D/IMAX, idioma, complejo).
- Próximos estrenos con sistema de alertas y suscripción a notificaciones.
- Detalle técnico completo, directores, sinopsis y recomendaciones similares.`,

  Functions: `### Módulo de Funciones y Horarios
Gestión de funciones de proyección en salas y complejos de cine:
- Consulta de funciones disponibles por película, formato y sala.
- Desglose de precios base, recargos por formato (VIP, IMAX, 3D) y promociones activas.
- Mapa interactivo de sillas en tiempo real (HU-010): disponibilidad, ocupación y sillas bloqueadas temporalmente.`,

  Cart: `### Módulo de Carrito Transaccional (HU-011)
Orquestación del carrito de compras para reserva de entradas y confitería:
- Creación de carrito a partir de sillas bloqueadas.
- Consulta del estado activo, expiración automática (TTL) y cálculo de totales.
- Modificación de cantidades de confitería y liberación de entradas.
- Cancelación voluntaria del carrito y liberación inmediata de sillas (RN-045).
- Aplicación de descuento automático por nivel de membresía (RN-047).
- Aplicación de saldo de bonos wallet o tarjetas de regalo.`,

  Snacks: `### Módulo de Confitería y Dulcería
Catálogo comercial y gestión de inventario para dulcería y combos:
- Catálogo general de productos de confitería agrupados por categorías (Combos, Bebidas, Popcorn, Dulces).
- Consulta de disponibilidad e inventario en tiempo real por complejo (RN-049).
- Adición, actualización y eliminación de productos de confitería en el carrito activo.`,

  Confitería: `### Módulo de Confitería y Dulcería
Catálogo comercial y gestión de inventario para dulcería y combos:
- Catálogo general de productos de confitería agrupados por categorías (Combos, Bebidas, Popcorn, Dulces).
- Consulta de disponibilidad e inventario en tiempo real por complejo (RN-049).
- Adición, actualización y eliminación de productos de confitería en el carrito activo.`,

  Reservations: `### Módulo de Selección y Reserva de Sillas
Gestión interactiva del bloqueo temporal de sillas para una función:
- Bloqueo temporal con expiración de 15 minutos (RN-039).
- Liberación voluntaria de sillas reservadas (RN-040).
- Consulta de resumen y desglose de la reserva antes de confirmar la compra.`,

  Membership: `### Módulo de Membresía Digital (HU-008)
Beneficios, niveles y promociones del programa de lealtad:
- Consulta del estado, puntos acumulados y nivel de membresía del usuario (Classic, Silver, Gold, Platinum).
- Matriz de beneficios y descuentos vigentes por nivel (RN-032).
- Creación administrativa manual de membresías.`,

  Profile: `### Módulo de Perfil de Usuario
Gestión de información personal y preferencias del usuario autenticado:
- Consulta del perfil de usuario y datos de contacto.
- Actualización de información personal, fecha de nacimiento, ciudad preferida y canales de notificación.`,

  Notifications: `### Módulo de Alertas y Notificaciones
Suscripción a alertas personalizadas:
- Registro de solicitudes para notificación de próximos estrenos al abrir cartelera.`,

  Users: `### Módulo de Usuarios y Geolocalización
Gestión administrativa y contexto geográfico:
- Registro y listado general de usuarios.
- Selección y validación de ciudad/ubicación activa para filtrar la cartelera y complejos cercanos.`,

  Countries: `### Módulo Geográfico: Países
Catálogo de países admitidos por la plataforma de cine.`,

  Departments: `### Módulo Geográfico: Departamentos
Catálogo de departamentos y provincias vinculadas a cada país.`,

  Cities: `### Módulo Geográfico: Ciudades
Catálogo de ciudades activas con complejos de cine y salas operativas.`,

  Seed: `### Módulo de Carga Masiva (Seed)
Utilidades administrativas para inicialización de base de datos desde payloads JSON estructurados o archivos.`,

  Health: `### Módulo de Salud del Sistema
Monitoreo de estado operativo, uptime y conectividad con la base de datos PostgreSQL.`,
};

export const endpointDocs = {
  // --- AUTH ---
  'POST:/auth/login': `### Autenticar usuario y generar tokens JWT

Inicia sesión con credenciales registradas. Valida contraseña mediante bcrypt (12 rounds) y emite un par de tokens JWT.

- **Autenticación requerida:** No (Público).
- **Control de seguridad:** Bloqueo temporal tras 5 intentos fallidos durante 15 minutos.
- **Respuesta:** Devuelve \`success\`, \`message\` y \`data\` con los datos del usuario y los tokens (\`accessToken\` y \`refreshToken\`).
- **Postman Auto-Sync:** Guarda automáticamente los tokens en las variables \`{{accessToken}}\` y \`{{refreshToken}}\`.`,

  'POST:/auth/register': `### Registrar un nuevo usuario y membresía digital

Crea una cuenta de usuario con estado pendiente de activación y asocia automáticamente una membresía digital inicial (HU-006).

- **Autenticación requerida:** No (Público).
- **Restricción de tasa:** Máximo 10 registros por ventana de 15 minutos por IP.
- **Respuesta:** Devuelve \`success\`, \`message\` y \`data\` con el usuario creado y la membresía asignada.`,

  'POST:/auth/verify-email': `### Verificar correo electrónico y activar cuenta

Valida el token recibido por correo electrónico y activa la cuenta del usuario para permitir el inicio de sesión.

- **Autenticación requerida:** No (Público).
- **Respuesta:** Devuelve exclusivamente \`success: true\` y \`message: "Cuenta Activada correctamente"\`. No expone entidades internas por seguridad.`,

  'POST:/auth/refresh': `### Renovar tokens de autenticación

Emite un nuevo \`accessToken\` a partir de un \`refreshToken\` válido y no expirado sin requerir reingreso de contraseña.

- **Autenticación requerida:** Requiere \`refreshToken\` en el cuerpo de la petición.
- **Respuesta:** Devuelve \`success\`, \`message\` y \`data\` con el nuevo token de acceso.`,

  'POST:/auth/logout': `### Cerrar sesión y revocar tokens

Invalida el \`refreshToken\` activo del usuario e impide renovaciones posteriores.

- **Autenticación requerida:** Bearer JWT (\`accessToken\`) o \`refreshToken\` en el cuerpo.
- **Respuesta:** Devuelve exclusivamente \`success: true\` y \`message: "Logged out successfully"\`.
- **Postman Auto-Sync:** Limpia automáticamente las variables de entorno \`{{accessToken}}\` y \`{{refreshToken}}\`.`,

  'POST:/auth/forgot-password': `### Solicitar enlace de restablecimiento de contraseña

Genera un token de recuperación y envía un correo electrónico si la dirección existe en el sistema.

- **Autenticación requerida:** No (Público).
- **Política de seguridad:** Siempre responde éxito para prevenir la enumeración de correos electrónicos.
- **Respuesta:** Devuelve exclusivamente \`success: true\` y \`message\`. No expone datos de usuario.`,

  'POST:/auth/reset-password': `### Restablecer contraseña con token de recuperación

Aplica una nueva contraseña segura para el usuario tras validar la vigencia del token de recuperación.

- **Autenticación requerida:** No (Público).
- **Respuesta:** Devuelve exclusivamente \`success: true\` y \`message\`. No expone datos internos.`,

  // --- MOVIES ---
  'GET:/movies': `### Obtener catálogo de películas activas

Lista todas las películas disponibles en el catálogo con proyección activa.

- **Autenticación requerida:** No (Público).
- **Respuesta:** Devuelve \`success\` y \`data\` con el array de películas (título, sinopsis, duración, clasificación, director).`,

  'GET:/movies/upcoming': `### Obtener películas en estado "Próximo Estreno"

Lista los títulos programados para estreno futuro en la plataforma.

- **Autenticación requerida:** No (Público).
- **Respuesta:** Devuelve \`success\` y \`data\` con las películas en próximo estreno.`,

  'GET:/movies/upcoming/:id': `### Obtener detalle de una película en "Próximo Estreno"

Consulta la ficha completa de un título en próximo estreno.

- **Parámetros de ruta:** \`:id\` (ID de la película).
- **Respuesta:** Devuelve \`success\` y \`data\` con el detalle técnico de la película.`,

  'GET:/movies/weekly': `### Obtener cartelera semanal (próximos 7 días)

Retorna la cartelera de películas programadas para los próximos 7 días a partir de la ciudad del usuario (HU-003).

- **Query Params:** \`cityId\` (Obligatorio, ID de la ciudad para geolocalización).
- **Respuesta:** Devuelve \`success\` y \`data\` con las películas y sus respectivas fechas de proyección.`,

  'GET:/movies/today': `### Obtener películas programadas para el día de hoy

Retorna los títulos con funciones programadas para la fecha actual en la ciudad seleccionada.

- **Query Params:** \`cityId\` (Obligatorio, ID de la ciudad).
- **Respuesta:** Devuelve \`success\` y \`data\` con la cartelera del día.`,

  'GET:/movies/filter': `### Filtrar películas y funciones por criterios múltiples

Búsqueda avanzada con filtros combinables: fecha, género, clasificación por edad, formato (2D, 3D, IMAX, VIP), idioma y complejo de cine.

- **Query Params:** \`cityId\`, \`date\`, \`genre\`, \`rating\`, \`language\`, \`format\`, \`cinemaId\`, \`available\`.
- **Respuesta:** Devuelve \`success\` y \`data\` con la lista filtrada de títulos y horarios disponibles.`,

  'GET:/movies/:id': `### Obtener detalle completo de una película por ID

Ficha técnica completa: título original, sinopsis, duración en minutos, género, director, clasificación y afiche promocional.

- **Parámetros de ruta:** \`:id\` (ID de la película).
- **Respuesta:** Devuelve \`success\` y \`data\` con el detalle de la película.`,

  'GET:/movies/:id/functions': `### Obtener funciones activas y futuras de una película

Lista todas las funciones disponibles para la película indicada, con opción de filtro por ciudad.

- **Parámetros de ruta:** \`:id\` (ID de la película).
- **Query Params:** \`cityId\` (ID de la ciudad).
- **Respuesta:** Devuelve \`success\` y \`data\` con las funciones asociadas.`,

  'GET:/movies/:id/recommendations': `### Obtener recomendaciones de películas similares

Retorna títulos recomendados basados en afinidad de género y director respecto a la película consultada.

- **Parámetros de ruta:** \`:id\` (ID de la película de referencia).
- **Respuesta:** Devuelve \`success\` y \`data\` con la lista de títulos afines.`,

  // --- FUNCTIONS ---
  'GET:/functions/movie/:id': `### Obtener funciones de una película con filtros

Consulta las funciones disponibles para una película según formato de proyección (2D, 3D, IMAX, VIP), fecha y complejo.

- **Parámetros de ruta:** \`:id\` (ID de la película).
- **Query Params:** \`format\`, \`date\`, \`cinemaId\`.
- **Respuesta:** Devuelve \`success\` y \`data\` con el listado de funciones y salas.`,

  'GET:/functions/:id': `### Obtener detalle de una función

Información sobre sala, complejo, película, formato de proyección y horario de inicio.

- **Parámetros de ruta:** \`:id\` (ID de la función).
- **Respuesta:** Devuelve \`success\` y \`data\` con los datos de la función.`,

  'GET:/functions/:id/prices': `### Obtener desglose de precios y promociones de una función

Calcula el valor base de la entrada, recargos por sala especializada (IMAX, 3D, VIP) y promociones del día aplicables.

- **Parámetros de ruta:** \`:id\` (ID de la función).
- **Respuesta:** Devuelve \`success\` y \`data\` con el desglose tarifario.`,

  'GET:/functions/:id/seats': `### Obtener mapa de sillas y disponibilidad en tiempo real (HU-010)

Representación matricial de la sala con estado en vivo de cada silla: disponible, ocupada, bloqueada o reservada.

- **Parámetros de ruta:** \`:id\` (ID de la función).
- **Respuesta:** Devuelve \`success\` y \`data\` con el layout de la sala y estado de asientos.`,

  // --- CART ---
  'POST:/cart': `### Crear carrito a partir de sillas seleccionadas

Inicia una sesión de compra creando el carrito activo asociado a la reserva de sillas del usuario.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Respuesta:** Devuelve \`success\` y \`data\` con el carrito creado (\`cartId\`, total estimado y tiempo de expiración).`,

  'GET:/cart': `### Obtener detalle completo del carrito activo

Consulta los ítems actuales del carrito: entradas reservadas, confitería agregada, subtotales, descuentos y saldo pendiente.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Respuesta:** Devuelve \`success\` y \`data\` con el desglose integral del carrito.`,

  'PUT:/cart': `### Modificar cantidades de confitería o quitar entradas del carrito

Permite actualizar unidades de snacks o remover entradas reservadas recalculando automáticamente los subtotales.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Respuesta:** Devuelve \`success\` y \`data\` con el carrito actualizado.`,

  'DELETE:/cart': `### Cancelar carrito activo y liberar sillas reservadas (RN-045)

Descarta la transacción en curso, anula el carrito activo y libera de inmediato las sillas retenidas para otros clientes.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Respuesta:** Devuelve \`success\` y \`data\` confirmando el ID del carrito cancelado.`,

  'POST:/cart/apply-membership': `### Aplicar descuento automático por membresía (RN-047)

Evalúa el nivel de membresía del usuario autenticado (Classic, Silver, Gold, Platinum) y aplica el porcentaje de descuento a entradas y confitería.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Respuesta:** Devuelve \`success\` y \`data\` con el valor del descuento aplicado y el nuevo total.`,

  'POST:/cart/apply-giftcard': `### Aplicar bonos del wallet del usuario al total del carrito

Debita saldo disponible de la billetera de bonos del usuario y lo descuenta del total a pagar en la transacción.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Respuesta:** Devuelve \`success\` y \`data\` con el saldo debitado y total neto restante.`,

  'POST:/cart/snacks': `### Añadir un producto de confitería al carrito activo

Agrega una cantidad específica de un snack o combo al carrito validando stock previo.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Respuesta:** Devuelve \`success\`, \`message\` y \`data\` con el ítem añadido.`,

  'GET:/cart/snacks': `### Obtener los productos de confitería en el carrito activo

Lista todos los snacks agregados a la compra actual con sus cantidades y subtotales.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Respuesta:** Devuelve \`success\` y \`data\` con los productos de confitería asociados.`,

  'PUT:/cart/snacks/:cartItemId': `### Actualizar cantidad de un ítem de confitería en el carrito

Modifica las unidades de un producto de dulcería en el carrito activo.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Parámetros de ruta:** \`:cartItemId\` (ID del ítem en el carrito).
- **Respuesta:** Devuelve \`success\` y \`data\` con el ítem actualizado.`,

  'DELETE:/cart/snacks/:cartItemId': `### Eliminar un ítem de confitería del carrito activo

Remueve por completo un producto de confitería de la compra activa.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Parámetros de ruta:** \`:cartItemId\` (ID del ítem en el carrito).
- **Respuesta:** Devuelve \`success\` y \`data\` confirmando la remoción.`,

  // --- SNACKS ---
  'GET:/snacks': `### Obtener catálogo completo de productos de confitería

Consulta de productos disponibles (crispetas, gaseosas, nachos, chocolates, combos) con opción de filtro por categoría.

- **Query Params:** \`category\` (ej. "Combos", "Bebidas", "Snacks").
- **Respuesta:** Devuelve \`success\` y \`data\` con el listado de productos de dulcería.`,

  'GET:/snacks/categories': `### Obtener lista de categorías disponibles de confitería

Retorna los grupos comerciales en los que se organizan los productos de confitería.

- **Respuesta:** Devuelve \`success\` y \`data\` con las categorías disponibles.`,

  'GET:/snacks/availability': `### Consultar disponibilidad e inventario en tiempo real (RN-049)

Verifica el inventario disponible de un producto de confitería para evitar sobreventas.

- **Query Params:** \`snackId\`, \`cinemaId\`, \`quantity\`.
- **Respuesta:** Devuelve \`success\` y \`data\` con el indicador de stock disponible.`,

  'GET:/snacks/:id': `### Obtener detalle de un producto de confitería

Ficha técnica con precio unitario, descripción, alérgenos e imagen comercial del snack.

- **Parámetros de ruta:** \`:id\` (ID del producto de confitería).
- **Respuesta:** Devuelve \`success\` y \`data\` con el detalle del producto.`,

  'POST:/snacks/cart': `### Añadir un producto de confitería al carrito del usuario

Variante de endpoint para registrar un ítem de confitería en el carrito activo.

- **Respuesta:** Devuelve \`success\`, \`message\` y \`data\` con el ítem agregado.`,

  'GET:/snacks/cart': `### Obtener productos de confitería en el carrito del usuario

Consulta los productos de confitería asociados al carrito mediante identificador de usuario.

- **Query Params:** \`userId\` (ID del usuario).
- **Respuesta:** Devuelve \`success\` y \`data\` con el array de ítems.`,

  'PUT:/snacks/cart/:cartItemId': `### Actualizar cantidad de confitería en carrito

Actualiza la cantidad de unidades para un producto de dulcería en el carrito.

- **Parámetros de ruta:** \`:cartItemId\`.
- **Respuesta:** Devuelve \`success\` y \`data\` con el ítem modificado.`,

  'DELETE:/snacks/cart/:cartItemId': `### Eliminar producto de confitería del carrito

Elimina un snack del carrito por su ID de ítem.

- **Parámetros de ruta:** \`:cartItemId\`.
- **Respuesta:** Devuelve \`success\` y \`data\` confirmando la eliminación.`,

  // --- RESERVATIONS ---
  'POST:/reservations/lock-seats': `### Bloquear temporalmente las sillas seleccionadas (RN-039)

Retiene las sillas elegidas durante una ventana máxima de 15 minutos para que el cliente complete el pago sin que otro usuario las tome.

- **Regla de negocio (RN-039):** Bloqueo transaccional temporal. Si expira el tiempo sin concretar la compra, las sillas se liberan automáticamente.
- **Respuesta:** Devuelve \`success\` y \`data\` con el \`reservationId\`, código de reserva y fecha límite de expiración.`,

  'DELETE:/reservations/release-seats': `### Liberar voluntariamente las sillas de una reserva activa (RN-040)

Libera anticipadamente las sillas retenidas cuando el cliente cancela la selección de asientos.

- **Respuesta:** Devuelve exclusivamente \`success: true\` y \`message: "Las sillas fueron liberadas exitosamente."\`. No expone entidades internas por diseño.`,

  'GET:/reservations/summary': `### Obtener el resumen de una reserva activa por query param

Consulta el estado, función asociada y sillas reservadas mediante el parámetro \`reservationId\`.

- **Query Params:** \`reservationId\` (ID de la reserva).
- **Respuesta:** Devuelve \`success\` y \`data\` con el consolidado de la reserva.`,

  'GET:/reservations/:id/summary': `### Obtener el resumen de una reserva por ID en ruta

Consulta el resumen consolidado de una reserva a partir de su ID en el path.

- **Parámetros de ruta:** \`:id\` (ID de la reserva).
- **Respuesta:** Devuelve \`success\` y \`data\` con los datos de la reserva.`,

  // --- PROFILE ---
  'GET:/profile': `### Consultar el perfil del usuario autenticado

Recupera la información del usuario en sesión: nombres, correo, teléfono, ciudad configurada y preferencias cinematográficas.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Respuesta:** Devuelve \`success\` y \`data\` con el perfil del usuario.`,

  'PUT:/profile': `### Actualizar información personal y preferencias del usuario

Actualiza datos personales, teléfono y preferencias del usuario autenticado.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Respuesta:** Devuelve \`success\`, \`message\` y \`data\` con el perfil actualizado.`,

  // --- NOTIFICATIONS ---
  'POST:/notifications/upcoming': `### Registrar solicitud de notificación para un próximo estreno

Permite al usuario registrar su correo o número telefónico para recibir una alerta inmediata en cuanto se abra la preventa o cartelera de una película en estreno futuro.

- **Respuesta:** Devuelve \`success\`, \`message\` y \`data\` con la confirmación de la suscripción.`,

  // --- MEMBERSHIP ---
  'GET:/membership': `### Consultar membresía digital del usuario autenticado

Obtiene los datos de la tarjeta digital de fidelización del usuario: código de membresía, nivel actual (Classic, Silver, Gold, Platinum) y puntos acumulados.

- **Autenticación:** Requiere Bearer JWT (\`{{accessToken}}\`).
- **Respuesta:** Devuelve \`success\` y \`data\` con el estado de la membresía.`,

  'GET:/membership/benefits': `### Consultar beneficios y descuentos vigentes por nivel de membresía (RN-032)

Retorna la matriz oficial de porcentajes de descuento en boletas y confitería, accesos preferenciales y acumulación de puntos por nivel.

- **Respuesta:** Devuelve \`success\` y \`data\` con la tabla de beneficios.`,

  'POST:/membership/create': `### Crear membresía digital manualmente para un usuario

Operación administrativa para generar o renovar la membresía de un usuario.

- **Respuesta:** Devuelve \`success\`, \`message\` y \`data\` con la membresía creada.`,

  // --- USERS & GEOLOCATION ---
  'POST:/users': `### Crear un nuevo usuario

Endpoint administrativo para la creación directa de usuarios en el sistema.

- **Respuesta:** Devuelve \`success\` y \`data\` con el usuario creado.`,

  'GET:/users': `### Obtener todos los usuarios

Endpoint administrativo para el listado paginado de usuarios registrados.

- **Respuesta:** Devuelve \`success\` y \`data\` con el listado de usuarios.`,

  'POST:/users/location': `### Seleccionar y validar ubicación geográfica del usuario

Valida la ciudad y departamento seleccionados por el usuario para fijar el contexto de salas, películas y cartelera.

- **Respuesta:** Devuelve \`success\`, \`message\` y \`data\` con la ubicación validada.`,

  'GET:/countries': `### Obtener catálogo de países

Retorna todos los países admitidos con sus respectivos códigos ISO e identificadores.

- **Respuesta:** Devuelve \`success\` y \`data\` con el array de países.`,

  'GET:/departments/:countryId': `### Obtener departamentos por país

Lista los departamentos o provincias asociados al identificador de país especificado.

- **Parámetros de ruta:** \`:countryId\` (ID del país).
- **Respuesta:** Devuelve \`success\` y \`data\` con la lista de departamentos.`,

  'GET:/cities/:departmentId': `### Obtener ciudades activas por departamento (solo con cine activo)

Filtra y devuelve únicamente las ciudades que cuentan con al menos un complejo de cine operativo y salas disponibles para venta.

- **Parámetros de ruta:** \`:departmentId\` (ID del departamento).
- **Respuesta:** Devuelve \`success\` y \`data\` con las ciudades activas.`,

  // --- SEED ---
  'POST:/seed/upload': `### Poblar base de datos desde un archivo JSON

Endpoint de desarrollo y despliegue para sembrar catálogos de películas, cines, géneros y salas mediante la carga de un archivo JSON.

- **Formato:** Multipart form-data con archivo JSON adjunto.
- **Respuesta:** Devuelve \`success\`, \`message\` y \`data\` con el resumen de registros insertados.`,

  'POST:/seed/json': `### Poblar base de datos desde un payload JSON directo

Endpoint de desarrollo para inyectar datos semilla enviando directamente un objeto JSON con usuarios, películas, cines y funciones.

- **Respuesta:** Devuelve \`success\`, \`message\` y \`data\` con el conteo de entidades insertadas.`,

  // --- HEALTH ---
  'GET:/health': `### Verificar estado de salud de la API y servicios

Comprueba el estado de la API, el tiempo de actividad (uptime) y la conectividad activa con el motor de base de datos PostgreSQL.

- **Respuesta:** Devuelve \`success\` y \`data\` con el estado operativo de los servicios.`,
};
