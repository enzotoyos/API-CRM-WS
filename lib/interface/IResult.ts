interface IResult {
    success: boolean;
    message?: string;
    total?: number
    result?: any;
    record?: any;
    error?: any[];
}

export = IResult;