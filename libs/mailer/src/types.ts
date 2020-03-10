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
