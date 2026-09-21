// app/src/models/email-verification-token.model.ts

import { createTokenModel } from './common/base-token-schema.js';

const EmailVerificationToken = createTokenModel('email_verification_tokens');

export type EmailVerificationTokenInstance = InstanceType<typeof EmailVerificationToken>;
export type { BaseTokenAttributes as EmailVerificationTokenAttributes } from './common/base-token-schema.js';
export type { BaseTokenCreationAttributes as EmailVerificationTokenCreationAttributes } from './common/base-token-schema.js';

export default EmailVerificationToken;
