// Imports
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { KeyBuilder } from '../../lib/redis/util';
import { RedisNamespaces } from '../../lib/types/redis';


@ApplyOptions<ScheduledTask.Options>({
    name: 'pollResults',
    pattern: '*/5 * * * *',
    bullJobsOptions: {
        removeOnComplete: true,
    },
})
export class PollResultsTask extends ScheduledTask {
    private readonly redisKey: string;

    public constructor(context: ScheduledTask.Context, options: ScheduledTask.Options) {
        super(context, { ...options });
        this.redisKey = new KeyBuilder(RedisNamespaces.Polls).build();
    }

    public async run() {
        const polls = this.getPolls();
        // do something
    }

    private async getPolls(): Promise<string[] | null> {
        const count = await container.redis.countSortedSet(this.redisKey);
        if (!count) return null;

        return container.redis.querySortedSet('polls', 0, Date.now());
    }
}
