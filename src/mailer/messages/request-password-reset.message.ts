import { Config } from '../../config';
import { MandrillMessage } from './index';

export function requestPasswordResetMessage(
    email: string,
    resetToken: string,
    frontendUrl: string,
): MandrillMessage {
    const url = `${frontendUrl}/auth/choose-password/${resetToken}`;
    return {
        subject: `${Config.projectName} admin portal - Forgot password`,
        text: `You initiated a request to reset your password for the ${Config.projectName} admin portal. Reset your password by clicking on this link: ${url}`,
        to: [{ email }],
    };
}
