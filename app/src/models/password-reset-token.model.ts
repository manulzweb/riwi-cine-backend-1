// app/src/models/password-reset-token.model.ts

import { createTokenModel } from './common/base-token-schema';

const PasswordResetToken = createTokenModel('password_reset_tokens');

export type PasswordResetTokenInstance = InstanceType<typeof PasswordResetToken>;
export type { BaseTokenAttributes as PasswordResetTokenAttributes } from './common/base-token-schema';
export type { BaseTokenCreationAttributes as PasswordResetTokenCreationAttributes } from './common/base-token-schema';

export default PasswordResetToken;
