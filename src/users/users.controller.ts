import { Controller, Post, Body } from '@nestjs/common';

import { CreateUserRequest } from './dto';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post()
    createUser(@Body() body: CreateUserRequest): Promise<void> {
        return this.userService.createUser(body);
    }
}
