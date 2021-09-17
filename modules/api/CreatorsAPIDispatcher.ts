import axios, { Method } from "axios";
import { CreatorsAPICommand } from "./CreatorsAPICommand";
import isDev from "electron-is-dev";
import log from "electron-log";

const apiEndpoint = "https://creators.tf/api/";

class CreatorsAPIDispatcher
{
    public static instance = new CreatorsAPIDispatcher();

    async ExecuteCommand(command: CreatorsAPICommand<any>){
        try{
            let resp = await axios.request({
                method: <Method>command.requestType,
                url: this.CreateRequestUrl(command),
                data: command.GetCommandBody(),
                params: command.GetCommandParameters(),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            command.OnResponse(resp.data);
        }
        catch (e) {
            if(command.OnFailure != null && command.OnFailure != undefined){
                if(isDev){
                    let error = <Error>e;
                    log.error(error.stack);
                }
                command.OnFailure(e);
            }
            else{
                throw e;
            }
        }
    }

    async ExecuteCommandAsync<T>(command: CreatorsAPICommand<T>) : Promise<T>{
        try{
            let resp = await axios.request({
                method: <Method>command.requestType,
                url: this.CreateRequestUrl(command),
                data: command.GetCommandBody(),
                params: command.GetCommandParameters(),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            return <T>resp.data;
        }
        catch (e) {
            if(isDev){
                let error = <Error>e;
                log.error(error.stack);
            }
            throw e;
        }
    }

    private CreateRequestUrl(command: CreatorsAPICommand<any>) : string{
        let baseUri = apiEndpoint + command.endpoint;
        return baseUri;
    }

    private MapToQueryString(map: Map<string, string>) : string{
        let queryStr = "?";
        for (const [key, value] of Object.entries(map)) {
            if(value != "" && value != undefined && value != null){
                queryStr += `${key}=${value}&`;
            }
        }

        return queryStr;
    }
}

export default CreatorsAPIDispatcher;