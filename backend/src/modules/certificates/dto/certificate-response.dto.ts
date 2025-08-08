import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { CertificateType, Status } from '../../../shared/dto';

export class CertificateResponseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  boat_id: number;

  @IsString()
  person: string;

  @IsString()
  date: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  expires?: string;

  @IsEnum(CertificateType)
  certificateType: CertificateType;

  @IsEnum(Status)
  status: Status;

  @IsString()
  description: string;

  @IsString()
  ipfs_hash: string;

  @IsOptional()
  @IsString()
  validated_by?: string;

  @IsOptional()
  @IsString()
  validated_at?: string;

  @IsString()
  created_at: string;
}