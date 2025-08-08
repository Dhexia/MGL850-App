import { IsEnum, IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { EventKind } from '../../../shared/dto';

export class CreateEventDto {
  @IsNumber()
  boatId: number;

  @IsEnum(EventKind)
  kind: EventKind;

  @IsNotEmpty()
  @IsString()
  ipfsHash: string;
}