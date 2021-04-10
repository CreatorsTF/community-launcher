import { CreatorsAPICommand } from "../CreatorsAPICommand";

class MatchStatusCommand extends CreatorsAPICommand<MatchStatusResponse>
{
    public endpoint = "IMatchmaking/Match";
    public requestType = "GET";

    private paramMap: any;

    constructor(match_id: string) {
        super();
        this.paramMap = {};
        this.paramMap["match_id"] = match_id;
    }

    GetCommandParameters() : any {
        return this.paramMap;
    }

    GetCommandBody() {
        return null;
    }
}

class MatchStatusResponse
{
    result: string;
    status: number;
    servers: Array<MatchmakingStatusServer>
}

class MatchmakingStatusServer
{
    id: number;
    ip: string;
    port: number;
    map: string;
    hostname: string;
    players: number;
    maxplayers: number;
    score: 20 // Amount of score this server collected, used to desc order servers in the response.
}

export { MatchStatusCommand, MatchStatusResponse, MatchmakingStatusServer} 