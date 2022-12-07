import { afterAll } from 'vitest';
import { client } from './mocks';

afterAll(() => {
	client.destroy();
});
