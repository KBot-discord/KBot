# Mute <Badge type='tip' text='Slash' />

Mute the selected user for the provided amount of time.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`, `Manage Roles`.
:::

| Option   | Required |  Default   | Description                                                                                  |
|----------|:--------:|:----------:|:---------------------------------------------------------------------------------------------|
| User     |    ✓     |            | Select a user or provide an ID to mute.                                                      |
| Reason   |    ✓     |            | Reason to DM the user.                                                                       |
| Duration |    ✕     | Indefinite | Amount to mute for. Cannot set longer than 30 days. Format is 1d2h3m (days, hours, minutes). |
| Silent   |    ✕     |   false    | True: mute will not show in logs, False: mute will show in logs.                             |
