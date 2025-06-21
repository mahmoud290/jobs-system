import { Body, Controller, Delete, Get,Param,ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dtos/create-job.dto";
import { GetJobsFilterDto } from "./dtos/get-jobs-filter.dto";
import { UpdateJobDto } from "./dtos/update-job.dto";
``
@Controller('jobs')
export class JobsController{
    constructor(
        private readonly jobsService:JobsService,
        private readonly jobService: JobsService,
    ){}

    @Post()
    createJob(@Body() dto:CreateJobDto){
        return this.jobsService.createJob(dto);
    }


    @Get()
getJobs(@Query() filterDto: GetJobsFilterDto) {
return this.jobsService.getJobs(filterDto);
}

@Get(':id')
getJobById(@Param('id', ParseIntPipe) id: number) {
return this.jobsService.getJobById(id);
}

@Patch(':id')
updateJob(
@Param('id', ParseIntPipe) id: number,
@Body() dto: UpdateJobDto,
) {
return this.jobsService.updateJob(id, dto);
}

@Delete(':id')
deleteJob(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.deleteJob(id);
}

@Get(':jobId/applied-users')
async getAppliedUsers(@Param('jobId') jobId:number){
    return await this.jobService.getAppliedUsers(jobId);
}

@Post('/:jobId/shortlist/:userId')
shortlist(
@Param('jobId', ParseIntPipe) jobId: number,
@Param('userId', ParseIntPipe) userId: number
) {
return this.jobsService.shortlistApplication(jobId, userId);
}

@Get('/:id/shortlisted-users')
getShortlistedUsers(@Param('id', ParseIntPipe) id: number) {
return this.jobsService.getShortlistedUsers(id);
}
}

