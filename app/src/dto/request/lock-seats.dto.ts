// app/src/dto/request/lock-seats.dto.ts

export interface LockSeatsDto {
  userId: number;
  functionId: number;
  seatIds: number[];
}
