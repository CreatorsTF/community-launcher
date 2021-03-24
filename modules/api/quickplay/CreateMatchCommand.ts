import { CreatorsAPICommand } from "../CreatorsAPICommand";

class CreateMatchCommand extends CreatorsAPICommand<CreateMatchmakingQueryResponse>
{
    public endpoint = "/api/IMatchmaking/Match";

    private paramMap: Map<string, string>;

    constructor(args: CreateMatchCommandParams) {
        super();
        this.paramMap = new Map<string, string>();
        this.paramMap["region"] = args.region;
        this.paramMap["missions"] = args.missions.join(",");
        this.paramMap["maps"] = args.maps.join(",");
        this.paramMap["region_locked"] = args.region_locked.toString();
    }

    GetCommandParameters(): Map<string, string> {
        return this.paramMap;
    }

    GetCommandBody(): string | undefined {
        return undefined;
    }
}

class CreateMatchCommandParams
{
    region: string;
    missions: string[];
    maps: string[];
    region_locked: boolean;
}

class CreateMatchmakingQueryResponse
{
    result: string;
    match_id: string;
}

export { CreateMatchCommand, CreateMatchCommandParams, CreateMatchmakingQueryResponse} 