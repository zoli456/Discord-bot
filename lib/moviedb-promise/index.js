const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
const __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (const p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieDb = void 0;
const moviedb_1 = require("./moviedb");
Object.defineProperty(exports, "MovieDb", {
  enumerable: true,
  get: function () {
    return moviedb_1.MovieDb;
  },
});
__exportStar(require("./types"), exports);
__exportStar(require("./request-types"), exports);
