// app/src/dto/request/register-user.dto.ts

/**
 * DTO de entrada para el registro de usuario.
 *
 * Este objeto representa los datos que el cliente envía a la API durante el
 * proceso de registro. Se usa para validar y tipar la entrada del controlador
 * antes de delegar la lógica al AuthService.
 *
 * @property {string} email - Correo electrónico principal del usuario.
 * @property {string} confirmEmail - Confirmación del correo electrónico.
 * @property {string} password - Contraseña del usuario.
 * @property {string} confirmPassword - Confirmación de la contraseña.
 * @property {string} phone - Teléfono de contacto.
 * @property {string} firstName - Nombre del usuario.
 * @property {string} lastName - Apellido del usuario.
 * @property {string} documentType - Tipo de documento.
 * @property {string} documentNumber - Número de documento.
 * @property {string} birthDate - Fecha de nacimiento en formato ISO YYYY-MM-DD.
 * @property {string} gender - Género opcional.
 * @property {number} cityId - Identificador principal de la ciudad.
 * @property {number} favoriteCinemaId - Identificador del cine favorito, si aplica.
 * @property {boolean} personalDataConsent - Aceptación del tratamiento de datos personales.
 * @property {boolean} termsConsent - Aceptación de términos y condiciones.
 * @property {boolean} commercialConsent - Consentimiento para comunicaciones comerciales.
 *
 * @example
 * const dto: RegisterUserRequestDto = {
 *   email: "david@example.com",
 *   confirmEmail: "david@example.com",
 *   password: "Password123!",
 *   confirmPassword: "Password123!",
 *   phone: "3001234567",
 *   firstName: "David",
 *   lastName: "García",
 *   documentType: "CC",
 *   documentNumber: "12345678",
 *   birthDate: "1990-01-01",
 *   gender: "Masculino",
 *   cityId: 1,
 *   favoriteCinemaId: 2,
 *   personalDataConsent: true,
 *   termsConsent: true,
 *   commercialConsent: true
 * };
 */
export interface RegisterUserRequestDto {
  /** Correo electrónico principal del usuario. */
  email: string;

  /** Confirmación del correo electrónico. */
  confirmEmail: string;

  /** Contraseña del usuario. */
  password: string;

  /** Confirmación de la contraseña. */
  confirmPassword: string;

  /** Teléfono de contacto. */
  phone: string;

  /** Nombre del usuario. */
  firstName: string;

  /** Apellido del usuario. */
  lastName: string;

  /** Tipo de documento. */
  documentType: string;

  /** Número de documento. */
  documentNumber: string;

  /** Fecha de nacimiento en formato ISO YYYY-MM-DD. */
  birthDate: string;

  /** Género opcional. */
  gender?: string;

  /** Identificador principal de la ciudad. */
  cityId: number;

  /** Identificador del cine favorito, si aplica. */
  favoriteCinemaId?: number;

  /** Aceptación del tratamiento de datos personales. */
  personalDataConsent: boolean;

  /** Aceptación de términos y condiciones. */
  termsConsent: boolean;

  /** Consentimiento para comunicaciones comerciales. */
  commercialConsent?: boolean;
}
