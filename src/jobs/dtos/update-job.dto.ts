import { IsOptional, IsString } from 'class-validator';

export class UpdateJobDto {
@IsOptional()
@IsString()
title?: string;

@IsOptional()
@IsString()
description?: string;

@IsOptional()
@IsString()
location?: string;

@IsOptional()
@IsString()
jobType?: string;
}
