import { CreatorsAPICommand } from "../CreatorsAPICommand";

class CreateMatchCommand extends CreatorsAPICommand<CreateMatchmakingQueryResponse>
{
    public endpoint = "IMatchmaking/Match";
    public requestType = "POST";

    private paramMap: any;

    constructor(args: CreateMatchCommandParams) {
        super();
        this.paramMap = {};
        this.paramMap["region"] = args.region;
        
        if(args.missions.length > 0)
            this.paramMap["missions"] = args.missions.join(",");

        this.paramMap["maps"] = args.maps.join(",");
        this.paramMap["region_locked"] = args.region_locked;
    }

    GetCommandParameters() : any {
        return null;
    }

    GetCommandBody() : string {
        return JSON.stringify(this.paramMap);
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