export class CreateCustomerDto {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    userId: number;
    companyId?: number;
}
