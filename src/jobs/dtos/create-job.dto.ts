import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobDto {
@IsNotEmpty()
@IsString()
title: string;

@IsNotEmpty()
@IsString()
description: string;

@IsNotEmpty()
@IsString()
location: string;

@IsNotEmpty()
@IsString()
jobType: string;
}
