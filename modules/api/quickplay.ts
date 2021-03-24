import CreatorsAPIDispatcher from "./CreatorsAPIDispatcher";
import {CreateMatchCommand, CreateMatchCommandParams, CreateMatchmakingQueryResponse} from "./quickplay/CreateMatchCommand";

const MM_QUERY_STATUS_INITITATED = 0;       // Default state of the MM query. All queries take this value when they're created.
const MM_QUERY_STATUS_FINDING_SERVERS = 1;  // Matchmaking system is currently searching through servers.
const MM_QUERY_STATUS_CHANGING_MAPS = 2;    // Initial server check failed, trying to change maps on empty servers.
const MM_QUERY_STATUS_FAILED = 3;           // We coulnd't find any servers that match our criteria.
const MM_QUERY_STATUS_CANCELLED = 4;        // User has cancelled the query.
const MM_QUERY_STATUS_FINISHED = 5;         // Matchmaking query succesfully found some servers.

class Quickplay {

    CreateNewMatch(params: CreateMatchCommandParams){
        let matchCmd = new CreateMatchCommand(params);
        matchCmd.OnResponse = (response: MatchmaingStatusQueryResponse) => {
            
        };
        CreatorsAPIDispatcher.instance.ExecuteCommand(matchCmd);
    }
}

class MatchmaingStatusQueryResponse
{
    result: string;
    status: number;
    servers: Array<MatchmakingStatusServer>;
}

class MatchmakingStatusServer
{
    id: number;
    ip: string;
    port: 27015
    map: string;
    hostname: string;
    players: number;
    maxplayers: number;
    score: 20 // Amount of score this server collected, used to desc order servers in the response.
}

export default Quickplay