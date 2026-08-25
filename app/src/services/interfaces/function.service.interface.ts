// app/src/services/interfaces/function.service.interface.ts

import {
  FunctionDetailDto,
  FunctionPriceDto,
  FunctionFiltersDto,
  FunctionSummaryDto,
} from '../../dto/function-detail.dto';

/**
 * Contrato del Servicio de Funciones (HU-009).
 */
export interface IFunctionService {
  getFunctionById(id: number): Promise<FunctionDetailDto>;
  getFunctionPrices(id: number): Promise<FunctionPriceDto>;
  getFunctionsByMovie(movieId: number, filters?: FunctionFiltersDto): Promise<FunctionSummaryDto[]>;
}
