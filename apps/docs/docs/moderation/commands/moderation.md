# Moderation <Badge type='tip' text='Slash' />

Edit the settings of the moderation module.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`.
:::

## /moderation toggle

Set new moderation module settings.

| Option | Required | Description                                                 |
|--------|:--------:|:------------------------------------------------------------|
| value  |    ✓     | True: the module is enabled. False: The module is disabled. |

## /moderation set

Reset moderation module settings.

| Option         | Required | Description                                  |
|----------------|:--------:|:---------------------------------------------|
| Mod log        |    ✕     | Select a channel to send moderation logs to. |
| Report channel |    ✕     | Select a channel to send reports to.         |
| Mute role      |    ✕     | Select a role to use for mutes.              |

## /moderation unset

Unset the current settings.

| Option         | Required | Description                               |
|----------------|:--------:|:------------------------------------------|
| Mod log        |    ✕     | Unset the current moderation log channel. |
| Report channel |    ✕     | Unset the current report channel.         |
| Mute role      |    ✕     | Unset the current mute role.              |

## /moderation permissions

Audit the bot's permissions for moderation features.

## /moderation settings

Show the current settings.
