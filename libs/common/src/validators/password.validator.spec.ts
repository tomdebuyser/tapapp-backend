import { validateSync } from 'class-validator';

import { IsPassword } from './password.validator';

class TestIsPassword {
    @IsPassword()
    password: string;
}

describe('PasswordValidator', () => {
    const validPasswords = [
        'Ditpasswordk4nermeedoor!',
        'poTvErdeKKe_dit_is_een_st3vig_passwoord',
        'Juistgeno3g',
        'Test1234',
    ];
    validPasswords.forEach(password => {
        it(`should pass for good passwords: ${password}`, () => {
            const instance = new TestIsPassword();
            instance.password = password;

            expect(validateSync(instance).length).toBe(0);
        });
    });

    const invalidPasswords = [
        '',
        'tekort',
        'nietveiliggenoeg',
        'j',
        'ditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeerditisechtgeenpaswoordmeer',
        12,
        false,
        undefined,
        null,
    ];
    invalidPasswords.forEach((password: any) => {
        it(`should fail for bad passwords: ${password}`, () => {
            const instance = new TestIsPassword();
            instance.password = password;

            expect(validateSync(instance).length).toBe(1);
        });
    });
});
