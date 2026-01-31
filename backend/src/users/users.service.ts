import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoles } from 'src/common/enums/user-roles.enum';

@Injectable()
export class UsersService {
  
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.username = createUserDto.username;
    user.email = createUserDto.email;
    user.password = createUserDto.password;
    user.fullName = createUserDto.fullName ?? '';
    user.role = createUserDto.role ?? UserRoles.CUSTOMER;

    return await this.userRepository.save(createUserDto);
  }

  public async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  public async findOne(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  public async findOneByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }
  
  public async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  public async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  public async softDelete(id: number): Promise<boolean> {
    const result = await this.userRepository.softDelete(id);
    return result.affected! > 0;
  }
}
