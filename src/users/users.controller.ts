import { Controller, Post, Body } from '@nestjs/common';

import { CreateUserRequest } from './dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post()
    createUser(@Body() body: CreateUserRequest): Promise<void> {
        return this.userService.createUser(body);
    }
}
