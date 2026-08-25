// app/src/controllers/movie-status.controller.ts

import { Request, Response } from 'express';
import MovieStatus from '../models/movie-status.model';

/**
 * Controlador para los estados de películas
 */
export const getMovieStatuses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const statuses = await MovieStatus.findAll({
      order: [['id', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: statuses,
      message: 'Estados de películas obtenidos exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los estados de películas',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const getMovieStatusById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const status = await MovieStatus.findByPk(id);

    if (!status) {
      res.status(404).json({
        success: false,
        message: 'Estado de película no encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: status,
      message: 'Estado de película obtenido exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el estado de película',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const createMovieStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({
        success: false,
        message: 'El nombre y la descripción son requeridos',
      });
      return;
    }

    const existingStatus = await MovieStatus.findOne({ where: { name } });

    if (existingStatus) {
      res.status(409).json({
        success: false,
        message: 'El estado de película ya existe',
      });
      return;
    }

    const status = await MovieStatus.create({
      name,
      description,
    });

    res.status(201).json({
      success: true,
      data: status,
      message: 'Estado de película creado exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el estado de película',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const updateMovieStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const status = await MovieStatus.findByPk(id);

    if (!status) {
      res.status(404).json({
        success: false,
        message: 'Estado de película no encontrado',
      });
      return;
    }

    await status.update({ name, description });

    res.status(200).json({
      success: true,
      data: status,
      message: 'Estado de película actualizado exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado de película',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const deleteMovieStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const status = await MovieStatus.findByPk(id);

    if (!status) {
      res.status(404).json({
        success: false,
        message: 'Estado de película no encontrado',
      });
      return;
    }

    await status.destroy();

    res.status(200).json({
      success: true,
      message: 'Estado de película eliminado exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el estado de película',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};
