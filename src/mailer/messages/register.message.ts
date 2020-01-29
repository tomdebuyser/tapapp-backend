import { Config } from '../../config';
import { MandrillMessage } from './index';

export function registerMessage(
    email: string,
    resetToken: string,
    frontendUrl: string,
): MandrillMessage {
    const url = `${frontendUrl}/auth/register/${resetToken}`;
    return {
        subject: `${Config.brandName} admin portal - Invitation`,
        text: `You have been invited to the ${Config.brandName} admin portal. Complete your registration by clicking on this link and choosing a password: ${url}`,
        to: [{ email }],
    };
}
