interface IOrganization {
    id?: string;
    address: string;
    customers: string[];
    name: string;
    nbworkers? : number;
    logo?: string;
    updatedAt?: any;
    createdAt?: any;
}

export = IOrganization;