// app/src/services/captcha/recaptcha-v2.adapter.ts

import { envConfig } from '../../config/env';
import { CaptchaResult, ICaptchaAdapter } from './interfaces/captcha.adapter';

/** Respuesta cruda de https://www.google.com/recaptcha/api/siteverify */
interface GoogleSiteVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Adaptador de verificación captcha basado en Google reCAPTCHA v2.
 *
 * Implementa el contrato `ICaptchaAdapter` delegando la validación
 * al endpoint oficial `siteverify` de Google. La configuración de la
 * URL de verificación y del tiempo máximo de espera se obtiene desde
 * `envConfig`.
 *
 * @class RecaptchaV2Adapter
 * @implements {ICaptchaAdapter}
 *
 * @security
 * La clave secreta del proveedor nunca se expone hacia el cliente.
 * El adaptador opera en modo "fail-closed": ante cualquier fallo
 * (timeout, error de red o respuesta inválida) la verificación es
 * rechazada, nunca aceptada.
 */
export class RecaptchaV2Adapter implements ICaptchaAdapter {
  private readonly secretkey: string;

  /**
   * Crea una instancia del adaptador de reCAPTCHA v2.
   *
   * @param {string} secretKey
   * Clave secreta del proveedor utilizada para autenticar las
   * peticiones contra `siteverify`.
   *
   * @throws {Error}
   * Cuando la clave secreta no es proporcionada estando reCAPTCHA habilitado.
   */
  constructor(secretKey: string) {
    if (!secretKey) throw new Error('RECAPTCHA_SECRET_KEY is required when RECAPTCHA_ENABLED=true');
    this.secretkey = secretKey;
  }

  /**
   * Verifica un token de reCAPTCHA v2 contra el endpoint `siteverify`.
   *
   * Envía la clave secreta y el token del cliente mediante una
   * petición POST con timeout configurado. Si la IP remota está
   * disponible se incluye como señal anti-fraude.
   *
   * @param {string} token
   * Token efímero generado por el widget del frontend (`captchaToken`).
   *
   * @param {string} [remoteIp]
   * IP del cliente (opcional; el proveedor la utiliza como señal
   * anti-fraude).
   *
   * @returns {Promise<CaptchaResult>}
   * Resultado homogéneo de la verificación. Nunca lanza excepciones:
   * cualquier fallo se traduce en un resultado fallido.
   */
  async verify(token: string, remoteIp?: string): Promise<CaptchaResult> {
    try {
      const body = new URLSearchParams({
        secret: this.secretkey,
        response: token,
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      });

      const response = await fetch(envConfig.RECAPTCHA.VERIFY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
        signal: AbortSignal.timeout(envConfig.RECAPTCHA.TIMEOUT_MS),
      });
      if (!response.ok) {
        return {
          success: false,
          reason: `siteverify responded with HTTP ${response.status}`,
        };
      }
      const data = (await response.json()) as GoogleSiteVerifyResponse;
      if (!data.success) {
        return {
          success: data.success,
          reason: data['error-codes']?.join(', ') ?? 'unknown-error',
        };
      }
      return {
        success: true,
      };
    } catch (error) {
      // Fail-closed: cualquier fallo (timeout, red, JSON inválido) rechaza.
      console.error('reCAPTCHA v2 verification failed:', error);
      return { success: false, reason: 'provider-unavailable' };
    }
  }
}
