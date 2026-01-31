import { Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from '../entities/employee.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EmployeeService {

  constructor(@InjectRepository(Employee) private employeeRepository: Repository<Employee>) {}

  public async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const employee = new Employee();
    employee.firstName = createEmployeeDto.firstName;
    employee.lastName = createEmployeeDto.lastName;
    employee.phone = createEmployeeDto.phone;
    employee.department = createEmployeeDto.department;
    employee.jobTitle = createEmployeeDto.jobTitle;
    employee.employeeId = createEmployeeDto.employeeId;
    employee.userId = createEmployeeDto.userId;
    employee.companyId = createEmployeeDto.companyId;

    return await this.employeeRepository.save(employee);
  }

  public async findAll(): Promise<Employee[]> {
    return await this.employeeRepository.find({ relations: ['user', 'company'] });
  }

  public async findOne(id: number): Promise<Employee | null> {
    return await this.employeeRepository.findOne({ where: { id }, relations: ['user', 'company'] });
  }

  public async findByUserId(userId: number): Promise<Employee | null> {
    return await this.employeeRepository.findOne({ where: { userId }, relations: ['user', 'company'] });
  }

  public async findByCompanyId(companyId: number): Promise<Employee[]> {
    return await this.employeeRepository.find({ where: { companyId }, relations: ['user', 'company'] });
  }

  public async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee | null> {
    const employee = await this.findOne(id);
    if (!employee) {
      return null;
    }
    Object.assign(employee, updateEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  public async softDelete(id: number): Promise<boolean> {
    const result = await this.employeeRepository.softDelete(id);
    return result.affected! > 0;
  }
}
