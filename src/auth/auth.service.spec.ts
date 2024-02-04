import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { createMock } from '@golevelup/ts-jest';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import validator from 'validator';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should returns a user and a token', async () => {
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation(() => Promise.resolve(true));

    jest
      .spyOn(userService, 'findOneByEmail')
      .mockImplementation(() => Promise.resolve(user));

    jest
      .spyOn(jwtService, 'signAsync')
      .mockImplementation(() => Promise.resolve('token'));

    const user: User = {
      _id: 0,
      created_at: undefined,
      updated_at: undefined,
      email: 'example@email.com',
      password: 'password',
      name: 'John Doe',
      admin: false,
      verified: true,
    };

    const newUser = await service.signIn({
      email: user.email,
      password: 'password',
    });
    expect(newUser).toStrictEqual({
      user: user,
      token: 'token',
    });
  });

  it('should throw a not found exception if the user is not found', async () => {
    jest
      .spyOn(userService, 'findOneByEmail')
      .mockImplementation(() => Promise.resolve(undefined));

    await expect(
      service.signIn({
        email: 'email',
        password: 'password',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw an unauthorized exception if the password is incorrect', async () => {
    jest
      .spyOn(userService, 'findOneByEmail')
      .mockImplementation(() => Promise.resolve(user));

    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation(() => Promise.resolve(false));

    const user: User = {
      _id: 0,
      created_at: undefined,
      updated_at: undefined,
      email: 'email',
      password: 'password',
      name: 'John Doe',
      admin: false,
      verified: true,
    };

    await expect(
      service.signIn({
        email: 'email',
        password: 'wrong password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw a bad request exception if there is password mismatch', () => {
    const user: CreateUserDto = {
      name: 'John Doe',
      email: 'email',
      password: 'password',
      confirmPassword: 'wrong password',
    };

    expect(service.register(user)).rejects.toThrow(BadRequestException);
  });

  it('should throw a bad request exception if the email is not valid', () => {
    const user: CreateUserDto = {
      name: 'John Doe',
      email: 'email',
      password: 'password',
      confirmPassword: 'password',
    };

    expect(service.register(user)).rejects.toThrow(BadRequestException);
  });

  it('should throw a bad request exception if the password is not strong enough', () => {
    const user: CreateUserDto = {
      name: 'John Doe',
      email: 'email',
      password: 'password',
      confirmPassword: 'password',
    };

    expect(service.register(user)).rejects.toThrow(BadRequestException);
  });

  it('should throw a bad request exception if there is no name', () => {
    const user: CreateUserDto = {
      name: 'John Doe',
      email: 'email',
      password: 'password',
      confirmPassword: 'password',
    };

    expect(service.register(user)).rejects.toThrow(BadRequestException);
  });

  it('should throw a bad request exception if email is already used', () => {
    jest
      .spyOn(userService, 'findOneByEmail')
      .mockImplementation(() => Promise.resolve(user));

    const user: User = {
      _id: 0,
      created_at: undefined,
      updated_at: undefined,
      email: 'email',
      password: 'password',
      name: 'John Doe',
      admin: false,
      verified: true,
    };

    expect(service.register(user)).rejects.toThrow(BadRequestException);
  });

  it('should return a user', async () => {
    jest
      .spyOn(userService, 'findOneByEmail')
      .mockImplementation(() => Promise.resolve(null));

    jest
      .spyOn(userService, 'create')
      .mockImplementation(() => Promise.resolve(user));

    jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'Pa$$w0rdS3cur3');
    jest.spyOn(validator, 'isEmail').mockImplementation(() => true);
    jest.spyOn(validator, 'isStrongPassword').mockImplementation(() => 1);

    const user: User = {
      _id: 0,
      created_at: undefined,
      updated_at: undefined,
      email: 'email@gmail.com',
      password: 'Pa$$w0rdS3cur3',
      name: 'John Doe',
      admin: false,
      verified: true,
    };

    const newUser = await service.register({
      name: user.name,
      email: user.email,
      password: user.password,
      confirmPassword: user.password,
    });

    expect(newUser).toStrictEqual(user);
  });
});
