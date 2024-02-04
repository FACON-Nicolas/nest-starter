import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
export class CreateUserDto {
  @ApiProperty({
    required: false,
    description: 'Current user name.',
  })
  name?: string;

  @ApiProperty({ description: 'Current user e-mail.' })
  email: string;

  @ApiProperty({ description: 'Current user password.' })
  password: string;

  @ApiProperty({
    required: false,
    description: 'Current user password confirmation.',
  })
  confirmPassword?: string;
}

@ApiTags('auth')
export class CreateLoginDto {
  @ApiProperty({ description: 'Current user e-mail.' })
  email: string;

  @ApiProperty({ description: 'Current user password.' })
  password: string;
}
