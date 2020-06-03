import {
    ValidationOptions,
    registerDecorator,
    ValidatorConstraintInterface,
    ValidatorConstraint,
} from 'class-validator';

const validatorName = 'IsPassword';

export function IsPassword(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string): void {
        registerDecorator({
            name: validatorName,
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsPasswordConstraint,
        });
    };
}

@ValidatorConstraint({ name: validatorName, async: false })
class IsPasswordConstraint implements ValidatorConstraintInterface {
    validate(value: string): boolean | Promise<boolean> {
        if (typeof value !== 'string') {
            return false;
        }

        const trimmedValue = value.trim();
        const isCorrectLength =
            trimmedValue.length >= 8 && trimmedValue.length < 255;

        // Only allow alphanumeric characters, dashes, and spaces
        const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;
        return isCorrectLength && passwordRegex.test(value);
    }

    defaultMessage?(): string {
        return 'Password requirements: min. 8 characters, at least one uppercase letter, one lowercase letter, and one number.';
    }
}
