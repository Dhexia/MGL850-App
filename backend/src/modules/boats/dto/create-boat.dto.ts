import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateBoatDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address' })
  to: string;

  @IsNotEmpty()
  @IsString()
  uri: string;
}