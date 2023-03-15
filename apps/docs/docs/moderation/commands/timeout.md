# Timeout <Badge type='tip' text='Slash' />

Timeout the selected user for the provided amount of time.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`, `Moderate Members`.
:::

| Option   | Required | Default | Description                                                                                     |
|----------|:--------:|:-------:|:------------------------------------------------------------------------------------------------|
| User     |    ✓     |         | Select a user or provide an ID to timeout.                                                      |
| Reason   |    ✓     |         | Reason to DM the user.                                                                          |
| Duration |    ✓     |         | Amount to timeout for. Cannot set longer than 28 days. Format is 1d2h3m (days, hours, minutes). |
| Silent   |    ✕     |  false  | True: timeout will not show in logs, False: timeout will show in logs.                          |
