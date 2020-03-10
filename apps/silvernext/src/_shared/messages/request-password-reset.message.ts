import { Config } from '../../config';

import { MandrillMessage } from '@libs/mailer';

export function requestPasswordResetMessage(
    email: string,
    resetToken: string,
    frontendUrl: string,
): MandrillMessage {
    const url = `${frontendUrl}/auth/choose-password/${resetToken}`;
    return {
        subject: `${Config.brandName} admin portal - Forgot password`,
        text: `You initiated a request to reset your password for the ${Config.brandName} admin portal. Reset your password by clicking on this link: ${url}`,
        to: [{ email }],
    };
}
