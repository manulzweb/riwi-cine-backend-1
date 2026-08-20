import { createTokenModel } from './common/base-token-schema';

const EmailVerificationToken = createTokenModel('email_verification_tokens');

export type EmailVerificationTokenInstance = InstanceType<typeof EmailVerificationToken>;
export type { BaseTokenAttributes as EmailVerificationTokenAttributes } from './common/base-token-schema';
export type { BaseTokenCreationAttributes as EmailVerificationTokenCreationAttributes } from './common/base-token-schema';

export default EmailVerificationToken;
