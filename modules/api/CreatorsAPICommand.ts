abstract class CreatorsAPICommand<Response>
{
    public requestType: string;
    public endpoint: string;
    public OnResponse: (response : Response) => void;
    public OnFailure: (any) => void;

    abstract GetCommandParameters() : any;
    abstract GetCommandBody() : string;
}

export {CreatorsAPICommand}