# Untimeout <Badge type='tip' text='Slash' />

Remove a timeout from the target member.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`, `Moderate Members`.
:::

| Option | Required |        Default        | Description                                                                |
|--------|:--------:|:---------------------:|:---------------------------------------------------------------------------|
| User   |    ✓     |                       | Select a user to untimeout.                                                |
| Reason |    ✕     | "No reason provided." | Reason for the untimeout.                                                  |
| DM     |    ✕     |         false         | DM the user the untimeout reason.                                          |
| Silent |    ✕     |         false         | True: untimeout will not show in logs, False: untimeout will show in logs. |
