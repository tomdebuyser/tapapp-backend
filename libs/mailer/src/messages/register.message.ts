import { MandrillMessage } from '@libs/mailer';
import { User } from '@libs/database';
import { MailTemplate } from '../mailer.types';

export function createRegisterMessage(
    user: User,
    sender: string,
    resetToken: string,
    brandName: string,
    frontendUrl: string,
): MandrillMessage {
    const url = `${frontendUrl}/auth/register/${resetToken}`;
    return {
        subject: `${brandName} admin portal - Invitation`,
        text: `You have been invited to the ${brandName} admin portal. Complete your registration by clicking on this link and choosing a password: ${url}`,
        html: {
            file: MailTemplate.Register,
            variables: {
                actionUrl: url,
                name: user.firstName || '',
                sender,
            },
        },
        to: [{ email: user.email }],
    };
}
