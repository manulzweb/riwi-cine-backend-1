// app/src/controllers/snack.controller.ts

import { Request, Response } from 'express';
import { SnackService } from '../services/snack.service';

const snackService = new SnackService();

/**
 * Obtiene los productos del catálogo de confitería.
 */
export const getAllSnacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string;
    const snacks = await snackService.getAll(category);
    res.status(200).json(snacks);
  } catch (error: any) {
    res.status(500).json({ error: "Error al obtener el catálogo de confitería" });
  }
};

/**
 * Procesa la adición de un snack al carrito de compras.
 */
export const addSnackToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { snackId, quantity } = req.body;
    
    const cartItem = await snackService.addToCart(snackId, quantity);
    
    res.status(201).json({
      message: 'Producto agregado al carrito con éxito.',
      data: cartItem
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
