import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { Customer } from '../entities/customer.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CustomerService {

  constructor(@InjectRepository(Customer) private customerRepository: Repository<Customer>) {}

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
