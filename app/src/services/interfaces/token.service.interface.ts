export interface ITokenService {
  generateAccessToken(userId: number): string;
}
