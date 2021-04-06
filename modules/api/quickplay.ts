import CreatorsAPIDispatcher from "./CreatorsAPIDispatcher";
import {CreateMatchCommand, CreateMatchCommandParams, CreateMatchmakingQueryResponse} from "./quickplay/CreateMatchCommand";
import QuickPlayConfigLoader from "../remote_file_loader/quickplay_config_loader";
import { ipcMain } from "electron";
import ElectronLog from "electron-log";
import { Utilities } from "../../modules/utilities";
import electronIsDev from "electron-is-dev";
import { IpcMainEvent } from "electron/main";
import { MatchStatusCommand } from "./quickplay/MatchStatusCommand";

const MM_QUERY_STATUS_INITITATED = 0;       // Default state of the MM query. All queries take this value when they're created.
const MM_QUERY_STATUS_FINDING_SERVERS = 1;  // Matchmaking system is currently searching through servers.
const MM_QUERY_STATUS_CHANGING_MAPS = 2;    // Initial server check failed, trying to change maps on empty servers.
const MM_QUERY_STATUS_FAILED = 3;           // We coulnd't find any servers that match our criteria.
const MM_QUERY_STATUS_CANCELLED = 4;        // User has cancelled the query.
const MM_QUERY_STATUS_FINISHED = 5;         // Matchmaking query succesfully found some servers.

class Quickplay {

    private currentMatchId: string;

    constructor(){
        ipcMain.on("InitQuickplay", async (event, args) => {
            ElectronLog.verbose("Sending Quickplay config to renderer");
            event.reply("quickplay-setup", QuickPlayConfigLoader.instance.GetFile());
        });
        
        ipcMain.on("quickplay-search", (event, arg) => {
            this.Search(event, arg);
        });
    }

    private async Search(event : IpcMainEvent, arg : any) {
        try {
            ElectronLog.log("Starting quickplay search...");
            let params = <CreateMatchCommandParams>arg;

            let resp = await this.CreateNewMatch(params);
            if(resp.result == "SUCCESS"){
                this.currentMatchId = resp.match_id;
                event.reply("quickplay-search-reply");
            }
        }
        catch (e) {
            let error = electronIsDev ? e.toString() : "Failed to start a quickplay search";
            Utilities.ErrorDialog(error, "Quickplay Error");
        }
    }

    private async WaitForMatchResult(matchId : string, event : IpcMainEvent){
        let statusCommand = new MatchStatusCommand(matchId);
        statusCommand.OnResponse = (resp) => {

        }
    }

    async CreateNewMatch(params: CreateMatchCommandParams) : Promise<CreateMatchmakingQueryResponse>{
        return new Promise((resp, rej) => {
            let matchCmd = new CreateMatchCommand(params);
            matchCmd.OnResponse = resp;
            matchCmd.OnFailure = rej;
            CreatorsAPIDispatcher.instance.ExecuteCommand(matchCmd);
        });
    }
    
}

export default Quickplay