import { validateSync } from 'class-validator';

import { IsName } from './name.validator';

class TestIsName {
    @IsName()
    name: string;
}

describe('NameValidator', () => {
    const validNames = ['Tester', 'Goede naam', 'Streepjes-mogen', "O'Brian"];
    validNames.forEach(name => {
        it(`should pass for good names: ${name}`, () => {
            const instance = new TestIsName();
            instance.name = name;

            expect(validateSync(instance).length).toBe(0);
        });
    });

    const invalidNames = [
        '',
        '12Naampje!',
        'Beste,kerel',
        'j',
        'ditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeerditisechtgeennaammeer',
        12,
        false,
        undefined,
        null,
    ];
    invalidNames.forEach((name: any) => {
        it(`should fail for bad names: ${name}`, () => {
            const instance = new TestIsName();
            instance.name = name;

            expect(validateSync(instance).length).toBe(1);
        });
    });
});
