# Ban <Badge type='tip' text='Slash' />

Ban the target member.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`, `Ban Members`.
:::

| Option   | Required |        Default        | Description                                                    |
|----------|:--------:|:---------------------:|:---------------------------------------------------------------|
| User     |    ✓     |                       | Select a user or provide an ID to ban.                         |
| Messages |    ✕     |         1 day         | Amount of messages to purge.                                   |
| Reason   |    ✕     | "No reason provided." | Reason for the ban.                                            |
| DM       |    ✕     |         false         | DM the user the ban reason.                                    |
| silent   |    ✕     |         false         | True: ban will not show in logs, False: ban will show in logs. |
