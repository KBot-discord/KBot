# Lock <Badge type='tip' text='Slash' />

Lock a channel.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`, `Manage Channels`.
:::

| Option   | Required |              Default               | Description                                                                                         |
|----------|:--------:|:----------------------------------:|:----------------------------------------------------------------------------------------------------|
| Role     |    ✕     |             @everyone              | Role to lock the channel for.                                                                       |
| Channel  |    ✕     | The channel the command is sent in | Channel to lock.                                                                                    |
| Duration |    ✕     |             Indefinite             | Length of time to lock for. Set nothing for no time limit. Format is 1d2h3m (days, hours, minutes). |
| Message  |    ✕     |             No message             | Message to be sent on locking.                                                                      |
