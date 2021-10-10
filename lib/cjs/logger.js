"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uniqid_1 = __importDefault(require("uniqid"));
class Logger {
    constructor({ level = 4, appName, correlation, session, userId, identifier, }) {
        this.LOG_LEVELS = {
            OFF: 0,
            ERROR: 1,
            INFO: 2,
            WARN: 3,
            DEBUG: 4,
        };
        this.appName = appName;
        this.level = process.env.LOG_LEVEL
            ? parseInt(process.env.LOG_LEVEL)
            : level;
        this.trace = `${correlation ? correlation : 'UNSET'}-${(0, uniqid_1.default)()}`;
        this.session = session;
        this.userId = userId;
        this.identifier = identifier;
    }
    start(self, status) {
        this.info(self, `${self} called`, status);
        this.time(`${self} - ${this.trace}`);
    }
    end(self, status) {
        this.info(self, `${self} invoked successfully`, status);
        this.timeEnd(`${self} - ${this.trace}`);
    }
    debug(origin, message, status) {
        if (this.level < this.LOG_LEVELS.DEBUG)
            return;
        console.debug(Object.assign(Object.assign(Object.assign(Object.assign({ origin,
            message, trace: this.trace, status: status || 200, ts: Date.now(), type: this.debug.name }, (this.session && { session: this.session })), (this.userId && { userId: this.userId })), (this.identifier && { identifier: this.identifier })), (this.appName && { app: this.appName })));
    }
    info(origin, message, status) {
        if (this.level < this.LOG_LEVELS.INFO)
            return;
        console.info(Object.assign(Object.assign(Object.assign(Object.assign({ origin,
            message, trace: this.trace, status: status || 200, ts: Date.now(), type: this.info.name }, (this.session && { session: this.session })), (this.userId && { userId: this.userId })), (this.identifier && { identifier: this.identifier })), (this.appName && { app: this.appName })));
    }
    warn(origin, message, status) {
        if (this.level < this.LOG_LEVELS.WARN)
            return;
        console.warn(Object.assign(Object.assign(Object.assign(Object.assign({ origin,
            message, trace: this.trace, status: status || 200, ts: Date.now(), type: this.warn.name }, (this.session && { session: this.session })), (this.userId && { userId: this.userId })), (this.identifier && { identifier: this.identifier })), (this.appName && { app: this.appName })));
    }
    error(origin, error, status, timeEnd = true) {
        if (this.level < this.LOG_LEVELS.ERROR)
            return;
        console.error(Object.assign(Object.assign(Object.assign(Object.assign({ origin, message: error.message, trace: this.trace, status: status || 500, ts: Date.now(), type: this.error.name }, (this.session && { session: this.session })), (this.userId && { userId: this.userId })), (this.identifier && { identifier: this.identifier })), (this.appName && { app: this.appName })));
        timeEnd && this.timeEnd(`${self} - ${this.trace}`);
    }
    time(label) {
        console.time(label);
    }
    timeEnd(label) {
        console.timeEnd(label);
    }
}
exports.default = Logger;
