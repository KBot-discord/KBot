import { Counter, Histogram } from 'prom-client';


export interface Counters {
    commands: {
        count: Counter;
        errors: Counter;
    }
}
