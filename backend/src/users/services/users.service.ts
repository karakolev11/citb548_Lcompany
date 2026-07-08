import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  public async create(createUserDto: CreateUserDto): Promise<User> {
    return this.createWithRole(createUserDto, 3);
  }

  public async createAdminUser(createUserDto: CreateUserDto): Promise<User> {
    return this.createWithRole(createUserDto, 1);
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

  public async deactivate(id: number): Promise<boolean> {
    const user = await this.findOne(id);
    if (!user) {
      return false;
    }
    user.username = `${user.username}__deactivated__${user.id}`;
    user.email = `deactivated+${user.id}@invalid.local`;
    await this.userRepository.save(user);
    const result = await this.userRepository.softDelete(id);
    return result.affected! > 0;
  }

  public async softDelete(id: number): Promise<boolean> {
    const result = await this.userRepository.softDelete(id);
    return result.affected! > 0;
  }

  private async createWithRole(createUserDto: CreateUserDto, roleId: number): Promise<User> {
    const user = new User();
    user.username = createUserDto.username;
    user.email = createUserDto.email;
    user.password = createUserDto.password;
    user.roleId = roleId;
    return await this.userRepository.save(user);
  }
}
