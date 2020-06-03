import { MandrillMessage } from '@libs/mailer';
import { User } from '@libs/database';
import { MailTemplate } from '../mailer.types';

export function createRequestPasswordResetMessage(
    user: User,
    resetToken: string,
    brandName: string,
    frontendUrl: string,
): MandrillMessage {
    const url = `${frontendUrl}/auth/choose-password/${resetToken}`;
    return {
        subject: `${brandName} admin portal - Forgot password`,
        text: `You recently requested to reset your password for your account on the ${brandName} admin portal. Reset your password by clicking on this link: ${url}`,
        html: {
            file: MailTemplate.RequestPasswordReset,
            variables: {
                actionUrl: url,
                name: user.firstName || '',
            },
        },
        to: [{ email: user.email }],
    };
}
