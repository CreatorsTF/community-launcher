import CreatorsAPIDispatcher from "./CreatorsAPIDispatcher";
import {CreateMatchCommand, CreateMatchCommandParams, CreateMatchmakingQueryResponse} from "./quickplay/CreateMatchCommand";
import QuickPlayConfigLoader from "../remote_file_loader/quickplay_config_loader";
import { ipcMain, shell } from "electron";
import ElectronLog from "electron-log";
import { Utilities } from "../../modules/utilities";
import electronIsDev from "electron-is-dev";
import { IpcMainEvent } from "electron/main";
import { MatchmakingStatusServer, MatchStatusCommand, MatchStatusResponse } from "./quickplay/MatchStatusCommand";

const STATUS_INITITATED = 0;       // Default state of the MM query. All queries take this value when they're created.
const STATUS_FINDING_SERVERS = 1;  // Matchmaking system is currently searching through servers.
const STATUS_CHANGING_MAPS = 2;    // Initial server check failed, trying to change maps on empty servers.
const STATUS_FAILED = 3;           // We coulnd't find any servers that match our criteria.
const STATUS_CANCELLED = 4;        // User has cancelled the query.
const STATUS_FINISHED = 5;         // Matchmaking query succesfully found some servers.

class Quickplay {

    private currentMatchId: string;

    constructor(){
        ipcMain.on("InitQuickplay", async (event, args) => {
            ElectronLog.verbose("Sending Quickplay config to renderer");
            event.reply("quickplay-setup", QuickPlayConfigLoader.instance.GetFile());
        });
        
        ipcMain.on("quickplay-search", (event, arg) => {
            this.currentMatchId = null;
            this.Search(event, arg);
        });

        ipcMain.on("quickplay-join", (event, arg : MatchmakingStatusServer) => {
            shell.openExternal(`steam://connect/${arg.ip}/${arg.port}`);
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
            await this.WaitForMatchResult(this.currentMatchId, event);
        }
        catch (e) {
            let error = electronIsDev ? e.toString() : "Failed to start a quickplay search";
            Utilities.ErrorDialog(error, "Quickplay Error");
        }
    }

    private async WaitForMatchResult(matchId : string, event : IpcMainEvent){
        let status = await this.GetEndMatchStatus(matchId);
        if(status.status == STATUS_FINISHED){
            event.reply("quickplay-search-success", status);
        }
        else {
            event.reply("quickplay-search-fail", null);
        }
    }

    private async GetEndMatchStatus(matchId : string) : Promise<MatchStatusResponse>{
        let resp = null;
        while(resp == null){
            ElectronLog.verbose("Starting new MatchStatusCommand");
            let statusCommand = new MatchStatusCommand(matchId);
            var _resp = await CreatorsAPIDispatcher.instance.ExecuteCommandAsync(statusCommand);
            switch(_resp.status){
                case STATUS_FINDING_SERVERS:
                case STATUS_CHANGING_MAPS:
                case STATUS_INITITATED:
                    ElectronLog.verbose("Retrying MatchStatusCommand");
                    //Try again!
                    resp = null;
                    break;
                case STATUS_FINISHED:
                case STATUS_FAILED:
                case STATUS_CANCELLED:
                    ElectronLog.verbose("Finished MatchStatusCommand, got FINISHED or FAILED");
                    resp = _resp;
                    break;
            }
        }

        return resp;
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