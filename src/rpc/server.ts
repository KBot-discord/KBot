import { createServer } from 'http';
import { createTwirpServer } from 'twirpscript';
import { config } from '../config';
import { channelHandler } from './handlers/discord/ChannelHandler';

const { port } = config.rpc.server;

const server = createTwirpServer([channelHandler]);

createServer(server).listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
