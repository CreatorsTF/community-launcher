abstract class CreatorsAPICommand<Response>
{
    public requestType: HTTPRequestType;
    public endpoint: string;
    public hasArguments: boolean;
    public OnResponse: (Response) => void;
    public OnFailure: string;

    abstract GetCommandParameters() : Map<string, string>;
    abstract GetCommandBody(): string | undefined;
}

enum HTTPRequestType{ GET, POST, DELETE}

export {CreatorsAPICommand, HTTPRequestType}