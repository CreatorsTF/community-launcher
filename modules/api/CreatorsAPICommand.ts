abstract class CreatorsAPICommand<Response>
{
    public requestType: string;
    public endpoint: string;
    public hasArguments: boolean;
    public OnResponse: (response : Response) => void;
    public OnFailure: (any) => void;

    abstract GetCommandParameters() : any;
}

export {CreatorsAPICommand}