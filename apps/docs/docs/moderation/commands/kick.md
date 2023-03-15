# Kick <Badge type='tip' text='Slash' />

Kick the target member.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`, `Kick Members`.
:::

| Option   | Required |        Default        | Description                                                                        |
|----------|:--------:|:---------------------:|:-----------------------------------------------------------------------------------|
| User     |    ✓     |                       | Select a user or provide an ID to kick. User must be in the server.                |
| Reason   |    ✕     | "No reason provided." | Reason for the kick.                                                               |
| DM       |    ✕     |         false         | DM the user the kick reason.                                                       |
| silent   |    ✕     |         false         | True: kick will not show in logs, False: kick will show in logs. (default: false). |
