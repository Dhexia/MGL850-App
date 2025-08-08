import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class BoatResponseDto {
  @IsBoolean()
  exists: boolean;

  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsOptional()
  @IsString()
  tokenURI?: string;

  @IsOptional()
  @IsString()
  mintedAt?: string;

  @IsOptional()
  @IsNumber()
  blockNumber?: number;

  @IsOptional()
  @IsString()
  txHash?: string;
}

export class BoatListItemDto {
  @IsNumber()
  id: number;

  @IsString()
  owner: string;

  @IsOptional()
  @IsString()
  tokenURI?: string;

  @IsOptional()
  @IsString()
  mintedAt?: string;

  @IsOptional()
  @IsNumber()
  blockNumber?: number;

  @IsOptional()
  @IsString()
  txHash?: string;
}