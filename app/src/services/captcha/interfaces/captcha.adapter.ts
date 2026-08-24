// app/src/services/captcha/interfaces/captcha.adapter.ts

/**
 * Resultado homogéneo de una verificación captcha.
 *
 * Ningún adaptador debe filtrar detalles del proveedor hacia afuera:
 * la razón es para logs internos, nunca para el cliente.
 */
export type CaptchaResult = { success: true } | { success: false; reason: string };

/**
 * Contrato que debe cumplir cualquier adaptador de captcha.
 *
 * Permite intercambiar proveedores (reCAPTCHA v2, adaptador no-op,
 * futuros proveedores) sin modificar el código consumidor.
 *
 * @interface ICaptchaAdapter
 */
export interface ICaptchaAdapter {
  /**
   * Verifica un token generado por el widget del frontend.
   *
   * @param token Token efímero enviado por el cliente (`captchaToken`).
   * @param remoteIp IP del cliente (opcional; algunos proveedores lo usan
   *                  como señal anti-fraude).
   */
  verify(token: string, remoteIp?: string): Promise<CaptchaResult>;
}
