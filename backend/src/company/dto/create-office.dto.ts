import {
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isLessThanField', async: false })
class IsLessThanFieldConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];

    if (value === undefined || value === null || relatedValue === undefined || relatedValue === null) {
      return true;
    }

    if (typeof value !== 'number' || typeof relatedValue !== 'number') {
      return false;
    }

    return value < relatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} must be less than ${relatedPropertyName}`;
  }
}

function IsLessThanField(
  relatedPropertyName: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isLessThanField',
      target: target.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      constraints: [relatedPropertyName],
      validator: IsLessThanFieldConstraint,
    });
  };
}

export class CreateOfficeDto {
  @IsString()
  name!: string;

  @IsString()
  location!: string;

  @IsNumber()
  @Min(0)
  @IsLessThanField('addressSurcharge')
  officeSurcharge!: number;

  @IsNumber()
  @Min(0)
  addressSurcharge!: number;

  @IsNumber()
  @Min(0)
  pricePerKg!: number;

  @IsInt()
  @IsPositive()
  companyId!: number;
}
