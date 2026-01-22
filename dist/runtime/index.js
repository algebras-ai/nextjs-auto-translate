"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAlgebrasIntl = exports.LocalesSwitcher = exports.AlgebrasIntlProvider = void 0;
var Provider_1 = require("./server/Provider");
Object.defineProperty(exports, "AlgebrasIntlProvider", { enumerable: true, get: function () { return __importDefault(Provider_1).default; } });
var LocaleSwitcher_1 = require("./client/components/LocaleSwitcher");
Object.defineProperty(exports, "LocalesSwitcher", { enumerable: true, get: function () { return __importDefault(LocaleSwitcher_1).default; } });
var Provider_2 = require("./client/Provider");
Object.defineProperty(exports, "useAlgebrasIntl", { enumerable: true, get: function () { return Provider_2.useAlgebrasIntl; } });
