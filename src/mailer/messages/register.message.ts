import { Config } from '../../config';
import { MandrillMessage } from './index';

export function registerMessage(
    email: string,
    resetToken: string,
    frontendUrl: string,
): MandrillMessage {
    const url = `${frontendUrl}/auth/register/${resetToken}`;
    return {
        subject: `${Config.projectName} admin portal invitation`,
        text: `You have been invited to the ${Config.projectName} admin portal. Complete your registration by clicking on this link and choosing a password: ${url}`,
        to: [{ email }],
    };
}