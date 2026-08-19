// app/src/controllers/snack.controller.ts

import { Request, Response } from 'express';
import { SnackService } from '../services/snack.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto/snack-cart.dto';

const snackService = new SnackService();

/**
 * Obtiene los productos del catálogo de confitería.
 */
export const getAllSnacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string;
    const snacks = await snackService.getAll(category);
    res.status(200).json(snacks);
  } catch {
    res.status(500).json({ error: "Error al obtener el catálogo de confitería" });
  }
};

/**
 * Obtiene la disponibilidad (stock) de los productos de confitería.
 */
export const getSnackAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const availability = await snackService.getAvailability();
    res.status(200).json(availability);
  } catch {
    res.status(500).json({ error: "Error al consultar la disponibilidad de confitería" });
  }
};

/**
 * Procesa la adición de un snack al carrito de compras.
 */
export const addSnackToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, snackId, quantity } = req.body;

    const dto: AddToCartDto = { userId, snackId, quantity };
    const cartItem = await snackService.addToCart(dto);

    res.status(201).json({
      message: 'Producto agregado al carrito con éxito.',
      data: cartItem
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Obtiene el carrito de compras del usuario con su valor total.
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
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Actualiza la cantidad de un ítem del carrito de compras.
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
      data: cartItem
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Elimina un producto de confitería del carrito de compras.
 */
export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.query.userId);
    const cartItemId = Number(req.params.cartItemId);

    await snackService.removeCartItem(userId, cartItemId);

    res.status(200).json({ message: 'Producto eliminado del carrito con éxito.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};