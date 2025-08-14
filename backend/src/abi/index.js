"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRegistry__factory = exports.BoatPassport__factory = exports.BoatEvents__factory = exports.BoatCertificate__factory = exports.Strings__factory = exports.SafeCast__factory = exports.IERC165__factory = exports.ERC165__factory = exports.IERC721Receiver__factory = exports.IERC721__factory = exports.IERC721Metadata__factory = exports.ERC721URIStorage__factory = exports.ERC721__factory = exports.IERC4906__factory = exports.IERC721Errors__factory = exports.IERC20Errors__factory = exports.IERC1155Errors__factory = exports.IAccessControl__factory = exports.AccessControl__factory = exports.factories = void 0;
exports.factories = __importStar(require("./factories"));
var AccessControl__factory_1 = require("./factories/@openzeppelin/contracts/access/AccessControl__factory");
Object.defineProperty(exports, "AccessControl__factory", { enumerable: true, get: function () { return AccessControl__factory_1.AccessControl__factory; } });
var IAccessControl__factory_1 = require("./factories/@openzeppelin/contracts/access/IAccessControl__factory");
Object.defineProperty(exports, "IAccessControl__factory", { enumerable: true, get: function () { return IAccessControl__factory_1.IAccessControl__factory; } });
var IERC1155Errors__factory_1 = require("./factories/@openzeppelin/contracts/interfaces/draft-IERC6093.sol/IERC1155Errors__factory");
Object.defineProperty(exports, "IERC1155Errors__factory", { enumerable: true, get: function () { return IERC1155Errors__factory_1.IERC1155Errors__factory; } });
var IERC20Errors__factory_1 = require("./factories/@openzeppelin/contracts/interfaces/draft-IERC6093.sol/IERC20Errors__factory");
Object.defineProperty(exports, "IERC20Errors__factory", { enumerable: true, get: function () { return IERC20Errors__factory_1.IERC20Errors__factory; } });
var IERC721Errors__factory_1 = require("./factories/@openzeppelin/contracts/interfaces/draft-IERC6093.sol/IERC721Errors__factory");
Object.defineProperty(exports, "IERC721Errors__factory", { enumerable: true, get: function () { return IERC721Errors__factory_1.IERC721Errors__factory; } });
var IERC4906__factory_1 = require("./factories/@openzeppelin/contracts/interfaces/IERC4906__factory");
Object.defineProperty(exports, "IERC4906__factory", { enumerable: true, get: function () { return IERC4906__factory_1.IERC4906__factory; } });
var ERC721__factory_1 = require("./factories/@openzeppelin/contracts/token/ERC721/ERC721__factory");
Object.defineProperty(exports, "ERC721__factory", { enumerable: true, get: function () { return ERC721__factory_1.ERC721__factory; } });
var ERC721URIStorage__factory_1 = require("./factories/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage__factory");
Object.defineProperty(exports, "ERC721URIStorage__factory", { enumerable: true, get: function () { return ERC721URIStorage__factory_1.ERC721URIStorage__factory; } });
var IERC721Metadata__factory_1 = require("./factories/@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata__factory");
Object.defineProperty(exports, "IERC721Metadata__factory", { enumerable: true, get: function () { return IERC721Metadata__factory_1.IERC721Metadata__factory; } });
var IERC721__factory_1 = require("./factories/@openzeppelin/contracts/token/ERC721/IERC721__factory");
Object.defineProperty(exports, "IERC721__factory", { enumerable: true, get: function () { return IERC721__factory_1.IERC721__factory; } });
var IERC721Receiver__factory_1 = require("./factories/@openzeppelin/contracts/token/ERC721/IERC721Receiver__factory");
Object.defineProperty(exports, "IERC721Receiver__factory", { enumerable: true, get: function () { return IERC721Receiver__factory_1.IERC721Receiver__factory; } });
var ERC165__factory_1 = require("./factories/@openzeppelin/contracts/utils/introspection/ERC165__factory");
Object.defineProperty(exports, "ERC165__factory", { enumerable: true, get: function () { return ERC165__factory_1.ERC165__factory; } });
var IERC165__factory_1 = require("./factories/@openzeppelin/contracts/utils/introspection/IERC165__factory");
Object.defineProperty(exports, "IERC165__factory", { enumerable: true, get: function () { return IERC165__factory_1.IERC165__factory; } });
var SafeCast__factory_1 = require("./factories/@openzeppelin/contracts/utils/math/SafeCast__factory");
Object.defineProperty(exports, "SafeCast__factory", { enumerable: true, get: function () { return SafeCast__factory_1.SafeCast__factory; } });
var Strings__factory_1 = require("./factories/@openzeppelin/contracts/utils/Strings__factory");
Object.defineProperty(exports, "Strings__factory", { enumerable: true, get: function () { return Strings__factory_1.Strings__factory; } });
var BoatCertificate__factory_1 = require("./factories/contracts/BoatCertificate__factory");
Object.defineProperty(exports, "BoatCertificate__factory", { enumerable: true, get: function () { return BoatCertificate__factory_1.BoatCertificate__factory; } });
var BoatEvents__factory_1 = require("./factories/contracts/BoatEvents__factory");
Object.defineProperty(exports, "BoatEvents__factory", { enumerable: true, get: function () { return BoatEvents__factory_1.BoatEvents__factory; } });
var BoatPassport__factory_1 = require("./factories/contracts/BoatPassport__factory");
Object.defineProperty(exports, "BoatPassport__factory", { enumerable: true, get: function () { return BoatPassport__factory_1.BoatPassport__factory; } });
var RoleRegistry__factory_1 = require("./factories/contracts/RoleRegistry__factory");
Object.defineProperty(exports, "RoleRegistry__factory", { enumerable: true, get: function () { return RoleRegistry__factory_1.RoleRegistry__factory; } });
