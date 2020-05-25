import {
    ValidatorConstraintInterface,
    ValidatorConstraint,
    ValidationArguments,
    ValidationOptions,
    registerDecorator,
} from 'class-validator';

const validatorName = 'NonNegativeInteger';

export function IsNonNegativeInteger(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string): void {
        registerDecorator({
            name: validatorName,
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsNonNegativeIntegerConstraint,
        });
    };
}

@ValidatorConstraint({ name: validatorName })
class IsNonNegativeIntegerConstraint implements ValidatorConstraintInterface {
    validate(value: number): boolean {
        if (typeof value !== 'number') {
            return false;
        }

        return value >= 0 && Number.isInteger(value);
    }

    defaultMessage?(validationArguments?: ValidationArguments): string {
        return `${validationArguments.value} is not a proper non-negative integer, must be 0 or larger and integer`;
    }
}
