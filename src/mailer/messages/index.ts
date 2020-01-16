export * from './register.message';
export * from './request-password-reset.message';

export interface MandrillMessage {
    html?: string;
    text?: string;
    subject?: string;
    from_name?: string;
    to: {
        email: string;
        name?: string;
        type?: 'to';
    }[];
}
