// app/src/controllers/snack.controller.ts

import { Request, Response } from 'express';
import snackService from '../services/snack.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto/snack-cart.dto';

/**
 * ============================================================================
 * Controlador de Confitería
 * ============================================================================
 *
 * Este controlador gestiona las solicitudes HTTP relacionadas con la
 * confitería y el carrito de compras del cine.
 *
 * Su única responsabilidad es actuar como intermediario entre el cliente
 * (HTTP) y la capa de servicios, delegando toda la lógica de negocio
 * al `SnackService`.
 *
 * Responsabilidades:
 *  - Recibir y procesar las solicitudes HTTP.
 *  - Obtener la información enviada por el cliente (body, query params, params).
 *  - Realizar validaciones básicas de entrada antes de delegar.
 *  - Traducir los errores de dominio a códigos de estado HTTP apropiados.
 *  - Construir la respuesta HTTP.
 *
 * Este controlador NO debe:
 *  - Contener reglas de negocio (validación de inventario, cálculo de
 *    precios efectivos, gestión del carrito, etc.).
 *  - Acceder directamente a la base de datos.
 *  - Ejecutar consultas mediante Sequelize.
 *  - Exponer detalles internos o información sensible en las respuestas.
 *
 * Arquitectura:
 *
 * Cliente HTTP
 *      │
 * SnackController
 *      │
 * SnackService
 *      │
 * SnackRepository / CartRepository / CartItemRepository / PromotionRepository
 *      │
 * Sequelize
 *      │
 * PostgreSQL
 * ============================================================================
 */

/**
 * Obtiene el catálogo completo de productos de confitería.
 *
 * Permite un filtro opcional por categoría mediante query parameter.
 * Cada producto incluye el precio efectivo calculado con promociones
 * y descuentos aplicados.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Query Parameters:
 * @example
 * ?category=Combos
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Lista de productos de confitería obtenida exitosamente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 */
export const getAllSnacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string;
    const snacks = await snackService.getAll(category);
    res.status(200).json(snacks);
  } catch (error: unknown) {
    console.error('Error al obtener el catálogo de confitería:', error);
    res.status(500).json({ error: 'Error al obtener el catálogo de confitería' });
  }
};

/**
 * Obtiene la disponibilidad (stock) de los productos de confitería.
 *
 * Permite al usuario consultar qué productos están disponibles antes
 * de agregarlos al carrito.
 *
 * Regla de Negocio RN-049: Un producto está disponible si tiene
 * stock mayor a cero.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Lista de productos con su disponibilidad.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 */
export const getSnackAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const availability = await snackService.getAvailability();
    res.status(200).json(availability);
  } catch (error: unknown) {
    console.error('Error al consultar la disponibilidad de confitería:', error);
    res.status(500).json({ error: 'Error al consultar la disponibilidad de confitería' });
  }
};

/**
 * Procesa la adición de un producto de confitería al carrito de compras.
 *
 * Obtiene el identificador del usuario, del producto y la cantidad solicitada
 * del cuerpo de la solicitud, y delega la validación de inventario y la
 * gestión del carrito en el `SnackService`.
 *
 * Regla de Negocio RN-049: Control estricto de inventario.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Espera recibir en el body:
 * @example
 * {
 *   "userId": 1,
 *   "snackId": 1,
 *   "quantity": 2
 * }
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **201 Created**
 *   Producto añadido al carrito exitosamente. Devuelve el ítem del
 *   carrito creado o actualizado.
 *
 * - **400 Bad Request**
 *   El producto de confitería no existe, el stock es insuficiente (RN-049),
 *   la cantidad no es válida o el usuario no existe.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 *
 * @throws {Error}
 * Capturado internamente y retornado como HTTP 400 cuando la validación
 * de inventario o datos falla.
 *
 * @security
 * - Los errores de inventario no revelan información interna del sistema.
 * - El mensaje de error incluye únicamente el stock disponible.
 */
export const addSnackToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, snackId, quantity } = req.body;

    const dto: AddToCartDto = { userId, snackId, quantity };
    const cartItem = await snackService.addToCart(dto);

    res.status(201).json({
      message: 'Producto agregado al carrito con éxito.',
      data: cartItem,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error('Error al añadir producto al carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtiene el carrito de compras del usuario con su valor total.
 *
 * Retorna el carrito con todos sus ítems, incluyendo nombre, imagen,
 * cantidad, precio unitario y subtotal de cada producto.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Query Parameters:
 * @example
 * ?userId=1
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Carrito obtenido exitosamente. Devuelve `cartId`, `items` y `total`.
 *   Si el usuario no tiene carrito, retorna `cartId: null`, `items: []`
 *   y `total: 0`.
 *
 * - **400 Bad Request**
 *   El parámetro `userId` es obligatorio y debe ser un número válido.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 */
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.query.userId);

    if (!userId || Number.isNaN(userId)) {
      res.status(400).json({ error: 'El parámetro userId es obligatorio.' });
      return;
    }

    const cart = await snackService.getCart(userId);
    res.status(200).json(cart);
  } catch (error: unknown) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Actualiza la cantidad de un ítem del carrito de compras.
 *
 * Valida que el ítem pertenezca al carrito del usuario y que la nueva
 * cantidad no supere el stock disponible.
 *
 * Regla de Negocio RN-049: Control estricto de inventario.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Query Parameters:
 * @example
 * ?userId=1
 *
 * Path Parameters:
 * @example
 * /cart/:cartItemId
 *
 * Request Body:
 * @example
 * {
 *   "quantity": 3
 * }
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Cantidad actualizada exitosamente. Devuelve el ítem actualizado.
 *
 * - **400 Bad Request**
 *   El parámetro `userId` es obligatorio, la cantidad no es válida,
 *   el ítem no existe o el stock es insuficiente.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 *
 * @throws {Error}
 * Capturado internamente y retornado como HTTP 400 cuando la validación
 * de inventario o datos falla.
 */
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.query.userId);
    const cartItemId = Number(req.params.cartItemId);
    const { quantity } = req.body;

    if (!userId || Number.isNaN(userId)) {
      res.status(400).json({ error: 'El parámetro userId es obligatorio.' });
      return;
    }

    const dto: UpdateCartItemDto = { quantity };
    const cartItem = await snackService.updateCartItem(userId, cartItemId, dto);

    res.status(200).json({
      message: 'Cantidad actualizada con éxito.',
      data: cartItem,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error('Error al actualizar el ítem del carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Elimina un producto de confitería del carrito de compras.
 *
 * El ítem debe pertenecer al carrito del usuario para poder
 * ser eliminado.
 *
 * @async
 *
 * @param {Request} req
 * Objeto de la petición HTTP.
 *
 * Query Parameters:
 * @example
 * ?userId=1
 *
 * Path Parameters:
 * @example
 * /cart/:cartItemId
 *
 * @param {Response} res
 * Objeto utilizado para construir la respuesta HTTP.
 *
 * @returns {Promise<void>}
 * Promesa que resuelve cuando la respuesta HTTP ha sido enviada.
 *
 * Posibles respuestas:
 *
 * - **200 OK**
 *   Producto eliminado del carrito exitosamente.
 *
 * - **400 Bad Request**
 *   El ítem no existe o no pertenece al carrito del usuario.
 *
 * - **500 Internal Server Error**
 *   Error inesperado durante el procesamiento.
 *
 * @throws {Error}
 * Capturado internamente y retornado como HTTP 400 cuando el ítem
 * no existe o no pertenece al usuario.
 */
export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.query.userId);
    const cartItemId = Number(req.params.cartItemId);

    await snackService.removeCartItem(userId, cartItemId);

    res.status(200).json({ message: 'Producto eliminado del carrito con éxito.' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error('Error al eliminar el ítem del carrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
