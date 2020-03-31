import {
    ValidationOptions,
    registerDecorator,
    ValidationArguments,
    ValidatorConstraintInterface,
    ValidatorConstraint,
} from 'class-validator';

const validatorName = 'IsName';

export function IsName(validationOptions?: ValidationOptions) {
    return function(object: object, propertyName: string): void {
        registerDecorator({
            name: validatorName,
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: IsNameConstraint,
        });
    };
}

@ValidatorConstraint({ name: validatorName, async: false })
class IsNameConstraint implements ValidatorConstraintInterface {
    validate(value: string): boolean | Promise<boolean> {
        if (typeof value !== 'string') {
            return false;
        }

        const trimmedValue = value.trim();
        const isCorrectLength =
            trimmedValue.length > 1 && trimmedValue.length < 255;

        // Only allow alphanumeric characters, dashes, and spaces
        const nameRegex = /^[a-zA-Z0-9- ]+$/;
        return isCorrectLength && nameRegex.test(value);
    }

    defaultMessage?(validationArguments?: ValidationArguments): string {
        return `${validationArguments.value} is not a proper name, must be between 1 and 255 characters and can only contain alphanumeric characters, spaces and dashes`;
    }
}
