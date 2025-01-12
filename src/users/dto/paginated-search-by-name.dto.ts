import { PaginationDto } from 'src/common/dto/pagination.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class PaginatedSearchByNameDto extends PaginationDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  name: string;
}
