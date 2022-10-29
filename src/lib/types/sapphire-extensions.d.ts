import type { Config } from "./config";
import type { Counters } from "./client";
import winston from 'winston';


declare module '@sapphire/pieces' {
    interface Container {
        config: Config;
        customLogger:  winston.Logger;
        counters: Counters;
    }
}