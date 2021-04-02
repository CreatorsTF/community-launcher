"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPRequestType = exports.CreatorsAPICommand = void 0;
var CreatorsAPICommand = (function () {
    function CreatorsAPICommand() {
    }
    return CreatorsAPICommand;
}());
exports.CreatorsAPICommand = CreatorsAPICommand;
var HTTPRequestType;
(function (HTTPRequestType) {
    HTTPRequestType[HTTPRequestType["GET"] = 0] = "GET";
    HTTPRequestType[HTTPRequestType["POST"] = 1] = "POST";
    HTTPRequestType[HTTPRequestType["DELETE"] = 2] = "DELETE";
})(HTTPRequestType || (HTTPRequestType = {}));
exports.HTTPRequestType = HTTPRequestType;
//# sourceMappingURL=CreatorsAPICommand.js.map