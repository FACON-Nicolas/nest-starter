import { config } from 'dotenv';

config();

export const jwtConstants = {
  secretOrPrivateKey: process.env.JWT_SECRET,
};
