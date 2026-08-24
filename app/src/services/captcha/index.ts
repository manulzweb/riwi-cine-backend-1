// app/src/services/captcha/index.ts

import { envConfig } from '../../config/env';
import { CaptchaResult, ICaptchaAdapter } from './interfaces/captcha.adapter';
import { RecaptchaV2Adapter } from './recaptcha-v2.adapter';

/**
 * Adaptador "no-op": acepta todo.
 *
 * Se usa cuando RECAPTCHA_ENABLED=false o NODE_ENV=test.
 * Mismo contrato => intercambiable sin tocar a nadie más.
 */
export class NoopCaptchaAdapter implements ICaptchaAdapter {
  /**
   * Acepta cualquier solicitud sin realizar verificación alguna.
   *
   * @returns {Promise<CaptchaResult>}
   * Resultado siempre exitoso (`success: true`).
   */
  async verify(): Promise<CaptchaResult> {
    return { success: true };
  }
}

/**
 * Crea el adaptador captcha según la configuración de entorno.
 *
 * Cuando `RECAPTCHA.ENABLED` está desactivado se retorna el adaptador
 * no-op; en caso contrario se retorna el adaptador de reCAPTCHA v2
 * configurado con la clave secreta del entorno.
 *
 * @returns {ICaptchaAdapter}
 * Implementación de `ICaptchaAdapter` correspondiente a la configuración.
 */
const createCatpchaAdapter = (): ICaptchaAdapter => {
  if (!envConfig.RECAPTCHA.ENABLED) {
    return new NoopCaptchaAdapter();
  }

  return new RecaptchaV2Adapter(envConfig.RECAPTCHA.SECRET_KEY);
};

/**
 * Instancia única del adaptador captcha utilizada por la aplicación.
 *
 * El adaptador concreto queda fijado durante el arranque según
 * `envConfig.RECAPTCHA.ENABLED`.
 *
 * @constant
 * @type {ICaptchaAdapter}
 */
const captchaAdapter = createCatpchaAdapter();

export default captchaAdapter;
