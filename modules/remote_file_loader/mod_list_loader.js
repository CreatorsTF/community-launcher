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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModListEntry = exports.ModList = exports.ModListLoader = void 0;
var remote_file_loader_1 = __importStar(require("./remote_file_loader"));
var ModListLoader = (function (_super) {
    __extends(ModListLoader, _super);
    function ModListLoader() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.remoteUrls = [
            "https://raw.githubusercontent.com/ampersoftware/Creators.TF-Community-Launcher/master/internal/mods.json",
            "https://fastdl.creators.tf/launcher/mods.json"
        ];
        _this.localFileName = "mods.json";
        return _this;
    }
    ModListLoader.instance = new ModListLoader();
    return ModListLoader;
}(remote_file_loader_1.default));
exports.ModListLoader = ModListLoader;
var ModList = (function (_super) {
    __extends(ModList, _super);
    function ModList() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ModList.prototype.GetMod = function (name) {
        for (var _i = 0, _a = this.mods; _i < _a.length; _i++) {
            var entry = _a[_i];
            if (entry.name == name) {
                return entry;
            }
        }
        return null;
    };
    return ModList;
}(remote_file_loader_1.RemoteFile));
exports.ModList = ModList;
var ModListEntry = (function () {
    function ModListEntry() {
    }
    return ModListEntry;
}());
exports.ModListEntry = ModListEntry;
//# sourceMappingURL=mod_list_loader.js.map