import { IsOptional, IsString } from 'class-validator';

export class GetJobsFilterDto {
@IsOptional()
@IsString()
search?: string;

@IsOptional()
@IsString()
location?: string;

@IsOptional()
@IsString()
jobType?: string;

@IsOptional()
@IsString()
page?: string;

@IsOptional()
@IsString()
limit?: string;
}
