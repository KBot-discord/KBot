---
title: Commands
---

# Commands

## Core

### Help <Badge type='tip' text='Slash' />

Get info about the bot and all of its commands.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`.
:::

### Pat <Badge type='tip' text='Context-Menu - User' />

Creates a pat gif of the member.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`, `Attach Files`.
:::

### Permissions <Badge type='tip' text='Slash' />

Info on how to change command permissions and the defaults that are set on the bot.
Same info can be found [here](/configuration/permissions.md).

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`.
:::

### Ping <Badge type='tip' text='Slash' />

Check the bot to see if it is alive.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`.
:::

### uwu <Badge type='tip' text='Context-Menu - Message' />

uwu-ify a message.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`.
:::

## Events

### Events <Badge type='tip' text='Slash' />

Change settings for the event module.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`.
:::

#### /events toggle

Enable or disable the events module

| Option | Required | Description                                                 |
| ------ | :------: | :---------------------------------------------------------- |
| Value  |    ✓     | True: the module is enabled. False: The module is disabled. |

#### /events settings

Show the current settings

### Karaoke <Badge type='tip' text='Slash' />

Join or leave the karaoke queue.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`.
:::

#### /karaoke join

Join the queue

#### /karaoke duet

Join queue as a duet

| Option  | Required | Description            |
| ------- | :------: | :--------------------- |
| Partner |    ✓     | Partner for your duet. |

#### /karaoke leave

Partner for your duet

#### /karaoke queue

Show the current queue

#### /karaoke help

Show info about karaoke commands

### Manage <Badge type='tip' text='Slash' />

Create or manage ongoing events.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`,
`Embed Links`, `Manage Events`, `Mute Members`, `Move Members`, `Manage Channels`.
:::

#### /manage karaoke start

Start a karaoke event.

| Option        | Required | Description                                         |
| ------------- | :------: | :-------------------------------------------------- |
| Voice channel |    ✓     | Choose the channel for the karaoke event.           |
| Text channel  |    ✓     | Channel to show queue rotations and instructions.   |
| Topic         |    ✕     | Name for the stage event (default: "Karaoke Event") |
| Role          |    ✕     | Role to ping for the event.                         |

#### /manage karaoke schedule

Schedule a karaoke event.

| Option        | Required | Description                                           |
| ------------- | :------: | :---------------------------------------------------- |
| Discord event |    ✓     | The Discord event that the karaoke event will be for. |
| Text channel  |    ✓     | Channel to show queue rotations and instructions.     |
| Role          |    ✕     | Role to ping for the event.                           |

#### /manage karaoke stop

Stop a karaoke event.

| Option | Required | Description        |
| ------ | :------: | :----------------- |
| Event  |    ✓     | The event to stop. |

#### /manage karaoke add

Add a user to a karaoke queue.

| Option | Required | Description                   |
| ------ | :------: | :---------------------------- |
| Event  |    ✓     | The event to add the user to. |
| User   |    ✓     | The user to add.              |

#### /manage karaoke remove

Remove a user to a karaoke queue

| Option | Required | Description                        |
| ------ | :------: | :--------------------------------- |
| Event  |    ✓     | The event to remove the user from. |
| User   |    ✓     | The user to remove.                |

#### /manage karaoke menu

Open the karaoke menu

## Moderation

### Anti-Hoist <Badge type='tip' text='Slash' />

Prevent usernames that place the user to the top of the member list.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`, `Manage Nicknames`.
:::

#### /antihoist toggle

Enable or disable anti-hoist

| Option | Required | Description                                                 |
| ------ | :------: | :---------------------------------------------------------- |
| Value  |    ✓     | True: anti-hoist is enabled. False: anti-hoist is disabled. |

### Minage <Badge type='tip' text='Slash' />

Have accounts under a certain age kicked.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`, `Kick Members`.
:::

#### /minage set

Set the account age requirements and kick message.

| Option   | Required | Description                                                    |
| -------- | :------: | :------------------------------------------------------------- |
| Days     |    ✕     | New users below the set age will be kicked and sent a message. |
| Response |    ✕     | Message to be sent on kick.                                    |

#### /minage unset

Unset the current settings.

| Option   | Required | Description                        |
| -------- | :------: | :--------------------------------- |
| Days     |    ✕     | Reset the required days to 0.      |
| Response |    ✕     | Reset the kick message to default. |

#### /minage settings

Show the current settings.

### Moderation <Badge type='tip' text='Slash' />

Edit the settings of the moderation module.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`.
:::

#### /moderation toggle

Set new moderation module settings.

| Option | Required | Description                                                 |
| ------ | :------: | :---------------------------------------------------------- |
| value  |    ✓     | True: the module is enabled. False: The module is disabled. |

#### /moderation set

Reset moderation module settings.

| Option         | Required | Description                                  |
| -------------- | :------: | :------------------------------------------- |
| Mod log        |    ✕     | Select a channel to send moderation logs to. |
| Report channel |    ✕     | Select a channel to send reports to.         |
| Mute role      |    ✕     | Select a role to use for mutes.              |

#### /moderation unset

Unset the current settings.

| Option         | Required | Description                               |
| -------------- | :------: | :---------------------------------------- |
| Mod log        |    ✕     | Unset the current moderation log channel. |
| Report channel |    ✕     | Unset the current report channel.         |
| Mute role      |    ✕     | Unset the current mute role.              |

#### /moderation permissions

Audit the bot's permissions for moderation features.

#### /moderation settings

Show the current settings.

### Report <Badge type='tip' text='Context-Menu - Message' />

Send the reported message to the set moderator channel.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`.
:::

### User <Badge type='tip' text='Slash' />

Get info on a user.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`.
:::

| Option | Required | Description                                 |
| ------ | :------: | :------------------------------------------ |
| User   |    ✓     | Select a user or provide ID to get info on. |

## Notifications

### YouTube <Badge type='tip' text='Slash' />

Get notified whenever a YouTube channel goes live.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`.
:::

#### /youtube subscribe

#### /youtube unsubscribe

#### /youtube set

#### /youtube unset

#### /youtube role_reaction

#### /youtube toggle

#### /youtube subscriptions

## Utility

## Welcome
