import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { Customer } from '../entities/customer.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { CreateCustomerWithUserDto } from '../dto/create-customer-with-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class CustomerService {

  constructor(
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  public async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = new Customer();
    customer.firstName = createCustomerDto.firstName;
    customer.lastName = createCustomerDto.lastName;
    customer.phone = createCustomerDto.phone;
    customer.address = createCustomerDto.address;
    customer.city = createCustomerDto.city;
    customer.state = createCustomerDto.state;
    customer.zipCode = createCustomerDto.zipCode;
    customer.country = createCustomerDto.country;
    customer.userId = createCustomerDto.userId;
    customer.companyId = createCustomerDto.companyId;

    return await this.customerRepository.save(customer);
  }

  public async createWithUser(payload: CreateCustomerWithUserDto): Promise<Customer> {
    const existingUsername = await this.usersService.findOneByUsername(payload.username);
    if (existingUsername) throw new ConflictException('Username already exists');
    const existingEmail = await this.usersService.findOneByEmail(payload.email);
    if (existingEmail) throw new ConflictException('Email already exists');

    return this.dataSource.transaction(async (manager) => {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const user = manager.create(User, {
        username: payload.username,
        email: payload.email,
        password: hashedPassword,
        roleId: 3,
      });
      const savedUser = await manager.save(User, user);

      const customer = manager.create(Customer, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        zipCode: payload.zipCode,
        country: payload.country,
        companyId: payload.companyId,
        userId: savedUser.id,
      });
      const savedCustomer = await manager.save(Customer, customer);

      return manager.findOneOrFail(Customer, {
        where: { id: savedCustomer.id },
        relations: ['user', 'company'],
      });
    });
  }

  public async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find({ relations: ['user', 'company'] });
  }

  public async findOne(id: number): Promise<Customer | null> {
    return await this.customerRepository.findOne({ where: { id }, relations: ['user', 'company'] });
  }

  public async findByUserId(userId: number): Promise<Customer | null> {
    return await this.customerRepository.findOne({ where: { userId }, relations: ['user', 'company'] });
  }

  public async findByCompanyId(companyId: number): Promise<Customer[]> {
    return await this.customerRepository.find({ where: { companyId }, relations: ['user', 'company'] });
  }

  public async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer | null> {
    const customer = await this.findOne(id);
    if (!customer) {
      return null;
    }
    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  public async softDelete(id: number): Promise<boolean> {
    const result = await this.customerRepository.softDelete(id);
    return result.affected! > 0;
  }
}
