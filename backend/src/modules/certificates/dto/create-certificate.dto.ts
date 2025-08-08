import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CertificateType, AttachmentDto } from '../../../shared/dto';

export class CreateCertificateDto {
  @IsNumber()
  boatId: number;

  @IsNotEmpty()
  @IsString()
  person: string;

  @IsNotEmpty()
  @IsString()
  date: string; // ISO date string

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  expires?: string; // ISO date string

  @IsEnum(CertificateType)
  certificateType: CertificateType;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  ipfsHash: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments: AttachmentDto[];
}