import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateLoginDto, CreateUserDto } from '../user/dto/create-user.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeaders,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiTags('auth')
  @ApiOkResponse({
    description: 'The user is signed in successfully.',
  })
  @ApiNotFoundResponse({
    description: 'The user used a non-existing e-mail address.',
  })
  @ApiBadRequestResponse({
    description: 'The user used a wrong password.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error.',
  })
  @ApiBody({
    description: 'User login information (email and password)',
    type: CreateLoginDto,
  })
  signIn(@Body() user: CreateLoginDto) {
    return this.authService.signIn(user);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiTags('auth')
  @ApiCreatedResponse({
    description: 'The user is registered successfully.',
  })
  @ApiBadRequestResponse({
    description:
      'bad password confirmation or invalid email or no nickname or weak password.',
  })
  @ApiConflictResponse({
    description: 'An address email that already exists has been used.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error.',
  })
  @ApiBody({
    description: 'User register information',
    type: CreateUserDto,
  })
  register(@Body() user: Required<CreateUserDto>) {
    return this.authService.register(user);
  }

  @Get('login-token')
  @UseGuards(AuthGuard)
  @ApiTags('auth')
  @ApiHeaders([
    {
      name: 'Authorization',
      description: 'Bearer token',
    },
  ])
  @ApiOkResponse({
    description: 'The user is signed in successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'A wrong or an expired token has been used.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error.',
  })
  async loginToken(@Request() req: Request & { user: User; token: string }) {
    return {
      token: req.token,
      user: await this.userService.findOneByEmail(req.user.email),
    };
  }
}
