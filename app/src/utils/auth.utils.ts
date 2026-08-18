/**
 * Valida las credenciales recibidas en una solicitud de autenticación
 * sin exponer ni registrar información sensible relacionada con la contraseña.
 *
 * Realiza validaciones básicas de estructura y longitud antes de enviar
 * las credenciales al servicio de autenticación.
 *
 * @param {string} email Valor recibido como correo electrónico.
 * @param {string} password Valor recibido como contraseña.
 *
 * @returns {string | null}
 * Mensaje descriptivo cuando la validación falla o `null` cuando
 * las credenciales cumplen las validaciones básicas.
 *
 * @security
 * La contraseña nunca se incluye en el mensaje de error ni se registra
 * en logs. Se utiliza `string` para validar explícitamente el tipo de los
 * valores recibidos desde una solicitud HTTP.
 */
export const validateCredentials = (email: string, password: string): string | null => {
  if (typeof email !== 'string' || !email.trim()) {
    return 'email is required';
  }

  if (typeof password !== 'string' || !password) {
    return 'password is required';
  }
  //preguntarle a david sobre las env
  if (email.length > 254) {
    return 'email is too long';
  }

  if (password.length < 12) {
    return 'password must contain at least 12 characters';
  }

  if (password.length > 128) {
    return 'password is too long';
  }

  return null;
};
