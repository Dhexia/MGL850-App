import { IsNotEmpty, IsString } from 'class-validator';

export class AttachmentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  uri: string;
}