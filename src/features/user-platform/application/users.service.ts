import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../repositories/users.repository';
import { CryptoService } from './crypto.service';
import { CreateUserInputDto } from '../api/input-dto/create-user.input-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async createUser(dto: CreateUserInputDto): Promise<string> {
    const isUserWithSameLoginOrEmailExist =
      await this.usersRepository.findByLoginOrEmail(dto.login, dto.email);
    if (isUserWithSameLoginOrEmailExist) {
      throw new BadRequestException([
        {
          message: 'User already exists',
          field: 'email or login',
        },
      ]);
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      password: passwordHash,
      confirmationCode: '',
      recoveryCode: '',
      isConfirmed: true,
      confirmationCodeExpirationDate: new Date().toISOString(),
      recoveryCodeExpirationDate: new Date().toISOString(),
    });

    await this.usersRepository.save(user);

    return user.id;
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.getByIdOrThrow(id);

    await this.usersRepository.delete(user);
  }
}
