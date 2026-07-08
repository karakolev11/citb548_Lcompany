import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from '../entities/employee.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Office } from 'src/company/entities/office.entity';
import { UsersService } from './users.service';
import { CreateEmployeeWithUserDto } from '../dto/create-employee-with-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class EmployeeService {

  constructor(
    @InjectRepository(Employee) private employeeRepository: Repository<Employee>,
    @InjectRepository(Office) private officeRepository: Repository<Office>,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  public async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const office = await this.officeRepository.findOne({ where: { id: createEmployeeDto.officeId }, relations: ['company'] });
    if (!office || !office.companyId) {
      throw new NotFoundException(`Office ${createEmployeeDto.officeId} not found`);
    }

    const employee = new Employee();
    employee.firstName = createEmployeeDto.firstName;
    employee.lastName = createEmployeeDto.lastName;
    employee.phone = createEmployeeDto.phone;
    employee.department = createEmployeeDto.department;
    employee.jobTitle = createEmployeeDto.jobTitle;
    employee.employeeId = createEmployeeDto.employeeId;
    employee.userId = createEmployeeDto.userId;
    employee.officeId = office.id;
    employee.companyId = office.companyId;

    return await this.employeeRepository.save(employee);
  }

  public async createWithUser(payload: CreateEmployeeWithUserDto): Promise<Employee> {
    const existingUsername = await this.usersService.findOneByUsername(payload.username);
    if (existingUsername) throw new ConflictException('Username already exists');
    const existingEmail = await this.usersService.findOneByEmail(payload.email);
    if (existingEmail) throw new ConflictException('Email already exists');

    const office = await this.officeRepository.findOne({ where: { id: payload.officeId }, relations: ['company'] });
    if (!office || !office.companyId) {
      throw new NotFoundException(`Office ${payload.officeId} not found`);
    }

    return this.dataSource.transaction(async (manager) => {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const user = manager.create(User, {
        username: payload.username,
        email: payload.email,
        password: hashedPassword,
        roleId: 2,
      });
      const savedUser = await manager.save(User, user);

      const employee = manager.create(Employee, {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        department: payload.department,
        jobTitle: payload.jobTitle,
        employeeId: payload.employeeId,
        userId: savedUser.id,
        officeId: office.id,
        companyId: office.companyId,
      });
      const savedEmployee = await manager.save(Employee, employee);
      return manager.findOneOrFail(Employee, {
        where: { id: savedEmployee.id },
        relations: ['user', 'company', 'office'],
      });
    });
  }

  public async findAll(): Promise<Employee[]> {
    return await this.employeeRepository.find({ relations: ['user', 'company', 'office'] });
  }

  public async findOne(id: number): Promise<Employee | null> {
    return await this.employeeRepository.findOne({ where: { id }, relations: ['user', 'company', 'office'] });
  }

  public async findByUserId(userId: number): Promise<Employee | null> {
    return await this.employeeRepository.findOne({ where: { userId }, relations: ['user', 'company', 'office'] });
  }

  public async findByCompanyId(companyId: number): Promise<Employee[]> {
    return await this.employeeRepository.find({ where: { companyId }, relations: ['user', 'company', 'office'] });
  }

  public async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee | null> {
    const employee = await this.findOne(id);
    if (!employee) {
      return null;
    }

    if (updateEmployeeDto.officeId !== undefined) {
      const office = await this.officeRepository.findOne({ where: { id: updateEmployeeDto.officeId }, relations: ['company'] });
      if (!office || !office.companyId) {
        throw new NotFoundException(`Office ${updateEmployeeDto.officeId} not found`);
      }
      employee.officeId = office.id;
      employee.companyId = office.companyId;
    }

    Object.assign(employee, updateEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  public async updateWithUser(id: number, updateEmployeeDto: UpdateEmployeeDto, updateUserDto: UpdateUserDto): Promise<Employee | null> {
    const employee = await this.findOne(id);
    if (!employee) {
      return null;
    }

    if (updateUserDto.username) {
      const existing = await this.usersService.findOneByUsername(updateUserDto.username);
      if (existing && existing.id !== employee.userId) {
        throw new ConflictException('Username already exists');
      }
    }
    if (updateUserDto.email) {
      const existing = await this.usersService.findOneByEmail(updateUserDto.email);
      if (existing && existing.id !== employee.userId) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.usersService.update(employee.userId, updateUserDto);
    return this.update(id, updateEmployeeDto);
  }

  public async softDelete(id: number): Promise<boolean> {
    const employee = await this.findOne(id);
    if (!employee) {
      return false;
    }
    const result = await this.employeeRepository.softDelete(id);
    if (!result.affected || !employee.userId) {
      return false;
    }
    await this.usersService.deactivate(employee.userId);
    return true;
  }
}
