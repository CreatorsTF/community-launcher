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
exports.MatchmakingStatusServer = exports.MatchStatusResponse = exports.MatchStatusCommand = void 0;
var CreatorsAPICommand_1 = require("../CreatorsAPICommand");
var MatchStatusCommand = (function (_super) {
    __extends(MatchStatusCommand, _super);
    function MatchStatusCommand(match_id) {
        var _this = _super.call(this) || this;
        _this.endpoint = "IMatchmaking/Match";
        _this.requestType = "GET";
        _this.paramMap = {};
        _this.paramMap["match_id"] = match_id;
        return _this;
    }
    MatchStatusCommand.prototype.GetCommandParameters = function () {
        return this.paramMap;
    };
    MatchStatusCommand.prototype.GetCommandBody = function () {
        return null;
    };
    return MatchStatusCommand;
}(CreatorsAPICommand_1.CreatorsAPICommand));
exports.MatchStatusCommand = MatchStatusCommand;
var MatchStatusResponse = (function () {
    function MatchStatusResponse() {
    }
    return MatchStatusResponse;
}());
exports.MatchStatusResponse = MatchStatusResponse;
var MatchmakingStatusServer = (function () {
    function MatchmakingStatusServer() {
    }
    return MatchmakingStatusServer;
}());
exports.MatchmakingStatusServer = MatchmakingStatusServer;
//# sourceMappingURL=MatchStatusCommand.js.map