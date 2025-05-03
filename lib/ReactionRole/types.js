export const default_db_config = {
  databaseName: "reactionrole",
  pretty: true,
  defaultDir: "data",
  prefix: "reactions",
};

export let EType;

(function (EType) {
  EType[(EType["NORMAL"] = 0)] = "NORMAL";
  EType[(EType["ONCE"] = 1)] = "ONCE";
  EType[(EType["REMOVE"] = 2)] = "REMOVE";
  EType[(EType["CUSTOM"] = 3)] = "CUSTOM";
})(EType || (EType = {}));

export default EType;
