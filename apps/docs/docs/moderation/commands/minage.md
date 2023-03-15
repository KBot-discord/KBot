# Minage <Badge type='tip' text='Slash' />

Have accounts under a certain age kicked.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`, `Kick Members`.
:::

## /minage set

Set the account age requirements and kick message.

| Option   | Required | Description                                                    |
|----------|:--------:|:---------------------------------------------------------------|
| Days     |    ✕     | New users below the set age will be kicked and sent a message. |
| Response |    ✕     | Message to be sent on kick.                                    |

## /minage unset

Unset the current settings.

| Option   | Required | Description                        |
|----------|:--------:|:-----------------------------------|
| Days     |    ✕     | Reset the required days to 0.      |
| Response |    ✕     | Reset the kick message to default. |

## /minage settings

Show the current settings.
