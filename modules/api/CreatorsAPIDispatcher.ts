import axios from "axios";
import path from "path";
import { CreatorsAPICommand, HTTPRequestType } from "./CreatorsAPICommand";

const apiEndpoint = "https://creators.tf/api";

class CreatorsAPIDispatcher
{
    public static instance = new CreatorsAPIDispatcher();

    async ExecuteCommand(command: CreatorsAPICommand<any>){
        try{
            switch(command.requestType){
                case HTTPRequestType.GET:
                    let response = await axios.get(this.CreateRequestUrl(command));
                    let jsonObject = JSON.parse(response.data.toString());
                    command.OnResponse(jsonObject);
                    break;
                case HTTPRequestType.POST:

                    break;
                case HTTPRequestType.DELETE:

                    break;
            }
        }
        catch {
            
        }
    }

    private CreateRequestUrl(command: CreatorsAPICommand<any>) : string{
        let baseUri = path.join(apiEndpoint, command.endpoint);

        if(command.hasArguments){
            baseUri += this.MapToQueryString(command.GetCommandParameters());
        }

        return baseUri;
    }

    private MapToQueryString(map: Map<string, string>) : string{
        let queryStr = "?";
        for (const [key, value] of Object.entries(map)) {
            queryStr += `${key}=${value}&`;
        }

        return queryStr;
    }
}

export default CreatorsAPIDispatcher;