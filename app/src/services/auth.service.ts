// app/src/services/auth.service.ts

import sequelize from '../config/database';
import { Transaction } from 'sequelize';

import { RegisterUserRequestDto } from '../dto/request/register-user.dto';
import { LoginUserRequestDto } from '../dto/request/login-user.dto';
import { VerifyEmailRequestDto } from '../dto/request/verify-email.dto';

import {
  IAuthService,
  LoginUserResult,
  RegisterUserResult,
} from './interfaces/auth.service.interface';

import { isValidPassword } from '../utils/password.util';
import { sendActivationEmail } from '../config/mailer';

import userRepository from '../repositories/user.repository';
import roleRepository from '../repositories/role.repository';
import profileRepository from '../repositories/profile.repository';
import membershipRepository from '../repositories/membership.repository';
import membershipLevelRepository from '../repositories/membership-level.repository';
import membershipStatusRepository from '../repositories/membership-status.repository';
import bonusWalletRepository from '../repositories/bonus-wallet.repository';
import notificationPreferenceRepository from '../repositories/notification-preference.repository';
import cityRepository from '../repositories/city.repository';
import cinemaRepository from '../repositories/cinema.repository';
import emailVerificationTokenRepository from '../repositories/email-verification-token.repository';

import passwordService from './password.service';
import tokenService from './token.service';
import emailVerificationTokenService from './email-verification-token.service';

const roleName = 'cliente';
const membershipLevelName = 'BÁSICA';
const membershipStatusName = 'Activa';

/**
 * Servicio encargado de gestionar los procesos de autenticación
 * y registro de usuarios.
 *
 * Responsabilidades:
 * - Validar los datos necesarios para el registro.
 * - Verificar referencias relacionadas.
 * - Coordinar la creación de las entidades asociadas al usuario.
 * - Gestionar la activación de cuentas mediante correo electrónico.
 * - Verificar credenciales durante el inicio de sesión.
 * - Delegar el procesamiento de contraseñas a `PasswordService`.
 * - Delegar la generación y verificación de tokens de correo a
 *   `EmailVerificationTokenService`.
 * - Delegar la generación de JWT de acceso a `TokenService`.
 *
 * El Service no realiza consultas directamente mediante Sequelize.
 * Todas las operaciones de persistencia son delegadas a los
 * correspondientes repositories.
 *
 * @class AuthService
 *
 * @security
 * Las contraseñas nunca deben almacenarse en texto plano.
 *
 * Los tokens de verificación nunca deben almacenarse en texto plano.
 * Únicamente debe persistirse su hash.
 *
 * Los JWT de acceso son generados exclusivamente mediante
 * `TokenService`.
 */
class AuthService implements IAuthService {
  /**
   * Registra un nuevo usuario en el sistema.
   *
   * El proceso valida los datos proporcionados, verifica las
   * configuraciones requeridas, genera las entidades relacionadas
   * y crea un token de activación para confirmar el correo electrónico.
   *
   * Las operaciones de persistencia relacionadas con el registro
   * se ejecutan dentro de una única transacción.
   *
   * @param {RegisterUserRequestDto} dto
   * Datos necesarios para registrar el usuario.
   *
   * @returns {Promise<RegisterUserResult>}
   * Identificador del usuario creado.
   *
   * @throws {Error}
   * Cuando los consentimientos requeridos no fueron aceptados.
   *
   * @throws {Error}
   * Cuando los correos electrónicos no coinciden.
   *
   * @throws {Error}
   * Cuando las contraseñas no coinciden.
   *
   * @throws {Error}
   * Cuando la contraseña no cumple las reglas de seguridad.
   *
   * @throws {Error}
   * Cuando el correo ya se encuentra registrado.
   *
   * @throws {Error}
   * Cuando alguna referencia requerida no existe.
   */
  async register(dto: RegisterUserRequestDto): Promise<RegisterUserResult> {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    const confirmEmail = dto.confirmEmail ? dto.confirmEmail.trim().toLowerCase() : '';

    /**
     * Validar los consentimientos obligatorios antes de comenzar
     * cualquier operación de persistencia.
     */
    if (!dto.personalDataConsent || !dto.termsConsent) {
      throw new Error(
        'Debe aceptar los términos y condiciones y el tratamiento de datos personales.',
      );
    }

    /**
     * Validar que ambos correos electrónicos coincidan.
     */
    if (email !== confirmEmail) {
      throw new Error('Los correos no coinciden');
    }

    /**
     * Validar que ambas contraseñas coincidan.
     */
    if (dto.password !== dto.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    /**
     * Validar las reglas de seguridad de la contraseña.
     */
    if (!dto.password || !isValidPassword(dto.password)) {
      throw new Error(
        'La contraseña debe tener al menos 10 caracteres, incluir mayúscula, minúscula, número y caracter especial.',
      );
    }

    /**
     * Verificar que el correo electrónico no se encuentre
     * registrado previamente.
     */
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error('El correo ya se encuentra registrado');
    }

    /**
     * Obtener el rol que será asignado al nuevo usuario.
     */
    const defaultRole = await roleRepository.findByName(roleName);

    if (!defaultRole) {
      throw new Error('No existe el rol por defecto configurado en el sistema');
    }

    /**
     * Obtener el nivel de membresía que será asignado
     * al nuevo usuario.
     */
    const defaultLevel = await membershipLevelRepository.findByName(membershipLevelName);

    if (!defaultLevel) {
      throw new Error('No existe el nivel de membresía por defecto configurado en el sistema');
    }

    /**
     * Obtener el estado inicial de la membresía.
     */
    const defaultStatus = await membershipStatusRepository.findByName(membershipStatusName);

    if (!defaultStatus) {
      throw new Error('No existe el estado de membresía por defecto configurado en el sistema');
    }

    /**
     * Validar que la ciudad seleccionada exista.
     */
    const city = await cityRepository.findById(dto.cityId);

    if (!city) {
      throw new Error('La ciudad principal seleccionada no existe');
    }

    /**
     * Validar el complejo favorito únicamente cuando
     * el usuario haya proporcionado uno.
     */
    if (dto.favoriteCinemaId) {
      const cinema = await cinemaRepository.findById(dto.favoriteCinemaId);

      if (!cinema) {
        throw new Error('El complejo favorito seleccionado no existe');
      }
    }

    /**
     * Generar el hash de la contraseña.
     *
     * El Service no conoce el algoritmo utilizado para generar
     * el hash. Esta responsabilidad pertenece a `PasswordService`.
     */
    const { hash: passwordHash } = await passwordService.hash(dto.password);

    /**
     * Generar el token de verificación de correo.
     *
     * El token original se conserva únicamente en memoria para
     * enviarlo posteriormente al usuario.
     *
     * El hash será el único valor persistido en la base de datos.
     */
    const emailVerificationToken = await emailVerificationTokenService.generate();

    /**
     * Código de membresía generado durante el registro.
     *
     * Se mantiene fuera de la transacción para conservar el valor
     * generado que será utilizado durante la creación de la membresía.
     */
    let membershipCode = '';

    /**
     * Ejecutar todas las operaciones de persistencia dentro
     * de una única transacción.
     *
     * Si alguna operación lanza un error, Sequelize revierte
     * automáticamente todas las operaciones realizadas dentro
     * de la transacción.
     */
    const result = await sequelize.transaction(async (transaction: Transaction) => {
      /**
       * 1. Crear la cuenta de usuario.
       */
      const user = await userRepository.create(
        {
          roleId: defaultRole.id,
          email,
          passwordHash,
          isActive: false,
          personalDataConsent: true,
          termsConsent: true,
          commercialConsent: !!dto.commercialConsent,
        },
        transaction,
      );

      /**
       * 2. Crear el perfil asociado al usuario.
       */
      await profileRepository.create(
        {
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          documentType: dto.documentType,
          documentNumber: dto.documentNumber,
          birthDate: new Date(dto.birthDate),
          gender: dto.gender || null,
          phone: dto.phone,
          cityId: dto.cityId,
          favoriteCinemaId: dto.favoriteCinemaId || null,
        },
        transaction,
      );

      /**
       * 3. Generar un código único de membresía.
       *
       * La generación del código pertenece al flujo de negocio,
       * mientras que la consulta para comprobar su existencia
       * pertenece al MembershipRepository.
       */
      let isUnique = false;

      while (!isUnique) {
        membershipCode =
          'MC-' +
          Math.floor(100000 + Math.random() * 900000) +
          '-' +
          Math.floor(100000 + Math.random() * 900000);

        const existingMembership = await membershipRepository.findByCode(
          membershipCode,
          transaction,
        );

        if (!existingMembership) {
          isUnique = true;
        }
      }

      /**
       * 4. Crear la membresía inicial del usuario.
       */
      await membershipRepository.create(
        {
          userId: user.id,
          code: membershipCode,
          levelId: defaultLevel.id,
          statusId: defaultStatus.id,
          pointsBalance: 0,
        },
        transaction,
      );

      /**
       * 5. Crear la billetera de bonos del usuario.
       */
      await bonusWalletRepository.create(
        {
          userId: user.id,
          balance: 0,
        },
        transaction,
      );

      /**
       * 6. Crear las preferencias de notificación
       * iniciales del usuario.
       */
      await notificationPreferenceRepository.create(
        {
          userId: user.id,
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
        },
        transaction,
      );

      /**
       * 7. Persistir el hash del token de verificación.
       *
       * El token original nunca se almacena en la base de datos.
       */
      await emailVerificationTokenRepository.create(
        {
          userId: user.id,
          tokenHash: emailVerificationToken.hash,
          expiresAt: emailVerificationToken.expiresAt,
        },
        transaction,
      );

      return user;
    });

    /**
     * El correo se envía después de completar correctamente
     * la transacción.
     *
     * De esta manera no se mantiene una operación externa
     * como el envío del correo dentro de la transacción de la BD.
     */
    try {
      await sendActivationEmail(email, emailVerificationToken.token);
    } catch (error) {
      console.error('No se pudo enviar el correo de activación:', error);
    }

    /**
     * El token de activación no se devuelve como access token.
     *
     * El usuario deberá verificar primero su correo y posteriormente
     * iniciar sesión para obtener un JWT de acceso.
     */
    return {
      userId: result.id,
      membershipCode: membershipCode,
      isActive: result.isActive,
    };
  }

  /**
   * Verifica el correo electrónico asociado a una cuenta.
   *
   * Busca el token de activación más reciente que no haya sido
   * utilizado, valida su vigencia y verifica su correspondencia
   * mediante `EmailVerificationTokenService`.
   *
   * Una vez validado correctamente:
   *
   * 1. Se activa la cuenta del usuario.
   * 2. Se marca el token como utilizado.
   *
   * @param {VerifyEmailRequestDto} dto
   * Correo electrónico y token de activación proporcionados
   * por el usuario.
   *
   * @returns {Promise<void>}
   *
   * @throws {Error}
   * Cuando el usuario no existe.
   *
   * @throws {Error}
   * Cuando la cuenta ya se encuentra activada.
   *
   * @throws {Error}
   * Cuando no existe un token válido.
   *
   * @throws {Error}
   * Cuando el token ha expirado.
   *
   * @throws {Error}
   * Cuando el token no coincide con el hash almacenado.
   */
  async verifyEmail(dto: VerifyEmailRequestDto): Promise<void> {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';

    /**
     * Obtener el usuario mediante el Repository.
     *
     * El Service no realiza consultas directas mediante Sequelize.
     */
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (user.isActive) {
      throw new Error('La cuenta ya se encuentra activada');
    }

    /**
     * Obtener el token de verificación más reciente que todavía
     * no haya sido utilizado.
     */
    const verificationRecord = await emailVerificationTokenRepository.findLatestUnusedByUserId(
      user.id,
    );

    if (!verificationRecord) {
      throw new Error('Token inválido');
    }

    /**
     * Validar la fecha de expiración del token.
     */
    if (new Date() > verificationRecord.expiresAt) {
      throw new Error('El token ha expirado, solicita uno nuevo');
    }

    /**
     * Verificar el token utilizando el servicio especializado.
     *
     * El Service no realiza directamente la comparación criptográfica.
     */
    const isMatch = await emailVerificationTokenService.verify(
      dto.token,
      verificationRecord.tokenHash,
    );

    if (!isMatch) {
      throw new Error('Token inválido');
    }

    /**
     * Activar la cuenta del usuario.
     */
    await userRepository.activate(user.id);

    /**
     * Marcar el token como utilizado para impedir
     * su reutilización.
     */
    await emailVerificationTokenRepository.markAsUsed(verificationRecord.id);
  }

  /**
   * Autentica un usuario mediante sus credenciales.
   *
   * El proceso verifica:
   * - Existencia del usuario.
   * - Estado de activación de la cuenta.
   * - Coincidencia de la contraseña.
   *
   * Una vez autenticado correctamente, genera un JWT de acceso
   * mediante `TokenService`.
   *
   * @param {LoginUserRequestDto} dto
   * Credenciales proporcionadas durante el inicio de sesión.
   *
   * @returns {Promise<LoginUserResult>}
   * Identificador del usuario y token JWT de acceso.
   *
   * @throws {Error}
   * Cuando las credenciales no son válidas.
   *
   * @throws {Error}
   * Cuando la cuenta todavía no ha sido activada.
   *
   * @security
   * La contraseña nunca se compara directamente con el hash.
   * La verificación se delega a `PasswordService`.
   */
  async login(dto: LoginUserRequestDto): Promise<LoginUserResult> {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';

    /**
     * Obtener el usuario mediante el Repository.
     */
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    /**
     * Impedir el inicio de sesión mientras la cuenta
     * no haya sido activada.
     */
    if (!user.isActive) {
      throw new Error('La cuenta no está activada');
    }

    /**
     * Verificar la contraseña mediante PasswordService.
     *
     * El AuthService no conoce directamente bcrypt.
     */
    const isMatch = await passwordService.verify(dto.password, user.passwordHash);

    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }

    /**
     * Generar el JWT de acceso únicamente después de
     * validar correctamente las credenciales.
     */
    const accessToken = tokenService.generateAccessToken(user.id);

    return {
      userId: user.id,
      accessToken,
    };
  }
}

/**
 * Instancia única del servicio de autenticación utilizada
 * por la aplicación.
 *
 * @constant
 * @type {AuthService}
 */
export const authService = new AuthService();

export default authService;
