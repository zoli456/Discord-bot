"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EType = exports.default_db_config = void 0;
exports.default_db_config = {
    databaseName: "reactionrole",
    pretty: true,
    defaultDir: "data",
    prefix: "reactions",
};
var EType;
(function (EType) {
    EType[EType["NORMAL"] = 0] = "NORMAL";
    EType[EType["ONCE"] = 1] = "ONCE";
    EType[EType["REMOVE"] = 2] = "REMOVE";
    EType[EType["CUSTOM"] = 3] = "CUSTOM";
})(EType = exports.EType || (exports.EType = {}));
