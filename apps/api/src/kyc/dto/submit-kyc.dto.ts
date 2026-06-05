import { KycSubmissionSchema, KycSubmission } from '@kyc/shared';
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodError } from 'zod';

export class SubmitKycDto implements KycSubmission {
  nome: string;
  data_nascimento: string;
  numero_bi: string;
  nif: string;
}

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: any) {}

  transform(value: any) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
