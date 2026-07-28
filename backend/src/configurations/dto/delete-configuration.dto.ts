import { IsString, MinLength } from 'class-validator';

export class DeleteConfigurationDto {
  @IsString()
  @MinLength(1)
  id!: string;
}
