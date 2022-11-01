// Types
import type { RedisNamespaces } from '../types/redis';


export class KeyBuilder {
    private key: string = '';

    public constructor(namespace: RedisNamespaces) {
        this.key.concat(namespace);
    }

    public addNamespace(namespace: RedisNamespaces): this {
        this.key.concat(`:${namespace}`);
        return this;
    }

    public addId(id: string | number): this {
        this.key.concat(`:${id}`);
        return this;
    }

    public addWildcard(): this {
        this.key.concat(':*');
        return this;
    }

    public build(): string {
        return this.key;
    }
}
