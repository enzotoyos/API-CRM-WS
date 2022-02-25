import IAppointement from './IAppointement'
interface ICustomer {
    phone: string;
    name: string;
    email: string;
    surname: string;
    filename?: string;
    age?: number;
    appointement: IAppointement[];
    updatedAt?: any;
    createdAt?: any;
}

export = ICustomer;