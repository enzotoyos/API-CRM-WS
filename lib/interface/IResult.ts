interface IResult {
    success: boolean;
    message?: string;
    result?: any;
    record?: any;
    error?: any[];
}

export = IResult;