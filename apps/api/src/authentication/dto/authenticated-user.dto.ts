export class AuthenticationUserResponse {
    readonly id: string;
    readonly email: string;
    readonly name: string;
    readonly organisation: {
        readonly id: string;
        readonly name: string;
    };
}
