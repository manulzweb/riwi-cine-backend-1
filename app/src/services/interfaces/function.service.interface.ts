// app/src/services/interfaces/function.service.interface.ts

import {
  FunctionDetailDto,
  FunctionPriceDto,
  FunctionFiltersDto,
  FunctionSummaryDto,
} from '../../dto/function-detail.dto.js';

export interface IFunctionService {
  /** Obtiene el detalle de una función específica validando que sea seleccionable. */
  getFunctionById(id: number): Promise<FunctionDetailDto>;

  /** Obtiene y calcula el desglose de precios y descuentos aplicables a una función. */
  getFunctionPrices(id: number): Promise<FunctionPriceDto>;

  /** Obtiene las funciones disponibles para una película aplicando filtros opcionales. */
  getFunctionsByMovie(movieId: number, filters?: FunctionFiltersDto): Promise<FunctionSummaryDto[]>;
}
