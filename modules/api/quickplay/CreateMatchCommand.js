"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMatchmakingQueryResponse = exports.CreateMatchCommandParams = exports.CreateMatchCommand = void 0;
var CreatorsAPICommand_1 = require("../CreatorsAPICommand");
var CreateMatchCommand = (function (_super) {
    __extends(CreateMatchCommand, _super);
    function CreateMatchCommand(args) {
        var _this = _super.call(this) || this;
        _this.endpoint = "IMatchmaking/Match";
        _this.requestType = "POST";
        _this.hasArguments = true;
        _this.paramMap = {};
        _this.paramMap["region"] = args.region;
        if (args.missions.length > 0)
            _this.paramMap["missions"] = args.missions.join(",");
        _this.paramMap["maps"] = args.maps.join(",");
        _this.paramMap["region_locked"] = args.region_locked;
        return _this;
    }
    CreateMatchCommand.prototype.GetCommandParameters = function () {
        return this.paramMap;
    };
    CreateMatchCommand.prototype.GetCommandBody = function () {
        return undefined;
    };
    return CreateMatchCommand;
}(CreatorsAPICommand_1.CreatorsAPICommand));
exports.CreateMatchCommand = CreateMatchCommand;
var CreateMatchCommandParams = (function () {
    function CreateMatchCommandParams() {
    }
    return CreateMatchCommandParams;
}());
exports.CreateMatchCommandParams = CreateMatchCommandParams;
var CreateMatchmakingQueryResponse = (function () {
    function CreateMatchmakingQueryResponse() {
    }
    return CreateMatchmakingQueryResponse;
}());
exports.CreateMatchmakingQueryResponse = CreateMatchmakingQueryResponse;
//# sourceMappingURL=CreateMatchCommand.js.map