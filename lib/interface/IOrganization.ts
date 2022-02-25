interface IAdmin {
    address: string;
    customers: string[];
    name: string;
    nbworkers? : number;
    logo?: string;
    updatedAt?: any;
    createdAt?: any;
}

export = IAdmin;