import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import validator from 'validator';
import { jwtConstants } from './constants';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CreateLoginDto, CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async signIn(
    userDto: CreateLoginDto,
  ): Promise<{ token: string; user: User }> {
    const user: User = await this.userService.findOneByEmail(userDto.email);

    if (!user) {
      throw new NotFoundException({ error: 'Adresse e-mail introuvable' });
    }

    const isMatch = await bcrypt.compare(userDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException({
        error: 'Votre mot de passe est incorrect',
      });
    }

    const payload = { sub: user.email, name: user.name };
    const token = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.secretOrPrivateKey,
    });

    return { token, user };
  }

  async register(userDto: CreateUserDto): Promise<User> {
    if (userDto.password !== userDto.confirmPassword) {
      throw new BadRequestException({
        error: 'Les mots de passes ne correspondent pas',
      });
    }

    if (!validator.isEmail(userDto.email)) {
      throw new BadRequestException({
        error: 'Veuillez saisir un e-mail valide',
      });
    }

    if (!validator.isStrongPassword(userDto.password || '')) {
      throw new BadRequestException({
        error: 'Veuillez saisir un mot de passe sécurisé',
      });
    }

    if (!userDto.name) {
      throw new BadRequestException({ error: 'Veuillez saisir un nom' });
    }

    const existingUser = await this.userService.findOneByEmail(userDto.email);
    if (existingUser) {
      throw new ConflictException({ error: 'E-mail déjà utilisée' });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(userDto.password, salt);

    return await this.userService.create({
      ...userDto,
      password: passwordHash,
    });
  }
}
