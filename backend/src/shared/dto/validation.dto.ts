import { IsEnum } from 'class-validator';
import { Status } from './enums';

export class ValidateDto {
  @IsEnum(Status)
  status: Status;
}