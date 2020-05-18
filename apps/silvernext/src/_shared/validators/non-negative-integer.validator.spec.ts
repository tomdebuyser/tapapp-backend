import { validateSync } from 'class-validator';

import { IsNonNegativeInteger } from './non-negative-integer.validator';

export class TestIsNonNegativeInteger {
    @IsNonNegativeInteger()
    skip: number;
}

describe('NonNegativeInteger', () => {
    const validValues = [0, 2, 250];
    validValues.forEach(value => {
        it(`should pass for good value: ${value}`, () => {
            const instance = new TestIsNonNegativeInteger();
            instance.skip = value;

            expect(validateSync(instance).length).toBe(0);
        });
    });

    const invalidValues = [-1, 2.4, -12.9, '0', null, undefined, [], {}];
    invalidValues.forEach((value: any) => {
        it(`should fail for bad values: ${value}`, () => {
            const instance = new TestIsNonNegativeInteger();
            instance.skip = value;

            expect(validateSync(instance).length).toBe(1);
        });
    });
});
