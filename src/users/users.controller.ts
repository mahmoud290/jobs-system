import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
@Controller('users')
export class UsersController{
    constructor(
        private readonly usersService:UsersService,
    ){}

    // POST/users
    @Post()
    create(@Body() createUserDto:CreateUserDto){
        return this.usersService.create(createUserDto);
    }

    // GET/users
    @Get()
    findAll(){
        return this.usersService.findAll();
    }

    // GET/user/:id
    @Get(':id')
    findOne(@Param('id',ParseIntPipe) id:number){
        return this.usersService.findOne(id);
    }

    // PATCH/users/:id
    @Patch(':id')
    update(
        @Param('id',ParseIntPipe) id:number,
        @Body() updateUserDto:UpdateUserDto,
    ){
        return this.usersService.update(id,updateUserDto);
    }

    // Delete/users/:id
    @Delete(':id')
    remove(@Param('id',ParseIntPipe) id:number){
        return this.usersService.remove(id);
    }
// apply jobs
    @Post(':userId/apply/:jobId')   
    async applyToJob(
        @Param('userId') userId: number,
        @Param('jobId') jobId: number,
    ){
        await this.usersService.applyToJob(userId, jobId);
        return { message: 'User applied to job successfully' };
    }
}