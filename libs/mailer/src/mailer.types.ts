export type MandrillMessage = {
    html: {
        file: MailTemplate;
        variables?: Record<string, string>;
    };
    text: string;
    subject: string;
    from_name?: string;
    to: {
        email: string;
        name?: string;
        type?: 'to';
    }[];
};

export enum MailTemplate {
    Register = 'register',
    RequestPasswordReset = 'request-password-reset',
}
