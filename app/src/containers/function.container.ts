// app/src/containers/function.container.ts

import { FunctionController } from '../controllers/function.controller.js';
import FunctionService from '../services/function.service.js';
import FunctionRepository from '../repositories/function.repository.js';
import MovieRepository from '../repositories/movie.repository.js';

// 1. Instanciar Repositorios
const functionRepository = new FunctionRepository();
const movieRepository = new MovieRepository();

// 2. Instanciar Servicio vía DI
const functionService = new FunctionService(functionRepository, movieRepository);

// 3. Exportar Controlador
export const functionController = new FunctionController(functionService);
