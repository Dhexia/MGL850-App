import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateBoatDto {
  @IsNotEmpty()
  @IsNumber()
  tokenId: number;

  @IsNotEmpty()
  @IsString()
  newUri: string;
}