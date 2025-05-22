import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  createUser(email: string, password: string) {
    // Logic to create a user
    return { email, password };
  }

  findUserByEmail(email: string) {
    // Logic to find a user by email
    return { email };
  }
}
