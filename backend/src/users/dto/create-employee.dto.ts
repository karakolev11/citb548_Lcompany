export class CreateEmployeeDto {
    firstName: string;
    lastName: string;
    phone?: string;
    department?: string;
    jobTitle?: string;
    employeeId?: string;
    userId: number;
    companyId: number;
}
