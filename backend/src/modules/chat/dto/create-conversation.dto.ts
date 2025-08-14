import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @IsNumber()
  priceInEth: number;

  @IsString()
  message: string;
}

export class CreateConversationDto {
  @IsArray()
  @IsString({ each: true })
  participants: string[];

  @IsOptional()
  @IsString()
  boatId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateOfferDto)
  offer?: CreateOfferDto;
}

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  messageType?: 'text' | 'offer' | 'system';
}