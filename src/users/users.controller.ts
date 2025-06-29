import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JobsService } from 'src/jobs/jobs.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jobsService: JobsService,
  ) {}

  // POST /users
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  // GET /users
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  // GET /users/:id
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findOne(id);
  }

  // PATCH /users/:id
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  // DELETE /users/:id
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.remove(id);
  }

  // POST /users/:userId/apply/:jobId
  @Post(':userId/apply/:jobId')
  async applyToJob(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('jobId', ParseIntPipe) jobId: number,
  ) {
    return await this.jobsService.applyToJob(jobId, userId);
  }
}
