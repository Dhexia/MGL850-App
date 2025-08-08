import { IsNumber, IsEnum, IsString, IsOptional } from 'class-validator';
import { EventKind, Status } from '../../../shared/dto';

export class EventResponseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  boat_id: number;

  @IsEnum(EventKind)
  kind: EventKind;

  @IsString()
  ts: string;

  @IsString()
  author: string;

  @IsString()
  ipfs_hash: string;

  @IsString()
  tx_hash: string;

  @IsNumber()
  block_number: number;

  @IsEnum(Status)
  status: Status;

  @IsOptional()
  @IsString()
  validated_by?: string;

  @IsOptional()
  @IsString()
  validated_at?: string;
}