import { channelHandler } from './handlers/discord/ChannelHandler';
import { config } from '../config';
import { createTwirpServer } from 'twirpscript';
import { createServer } from 'http';

const { port } = config.rpc.server;

const server = createTwirpServer([channelHandler]);

createServer(server).listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
