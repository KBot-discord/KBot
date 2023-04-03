---
title: Commands
---

# Commands

## Core Commands

### Echo <Badge type='tip' text='Slash' />

Sends the provided text to the selected channel.

| Option  | Required | Description                         |
| ------- | :------: | :---------------------------------- |
| Text    |    ✓     | The text of the message.            |
| Channel |    ✓     | The channel to send the message to. |

### Help <Badge type='tip' text='Slash' />

Get info about the bot and all of it's commands.

| Option  | Required | Description                        |
| ------- | :------: | :--------------------------------- |
| Command |    ✕     | Get info about a specific command. |

### Pat <Badge type='tip' text='Context-Menu - User' />

Creates a pat gif of the member.

### Permissions <Badge type='tip' text='Slash' />

Info on how to change command permissions and the defaults that are set on the bot.
Same info can be found [here](/configuration/permissions).

### Ping <Badge type='tip' text='Slash' />

Ping the bot to see if it is alive.

### uwu <Badge type='tip' text='Context-Menu - Message' />

uwu-ify a message.

## Event Commands

### Events <Badge type='tip' text='Slash' />

Edit the settings of the events module.

#### /events toggle

Enable or disable the events module.

| Option | Required | Description                                                 |
| ------ | :------: | :---------------------------------------------------------- |
| Value  |    ✓     | True: the module is enabled. False: The module is disabled. |

#### /events settings

Show the current settings.

### Karaoke <Badge type='tip' text='Slash' />

Join or leave the karaoke queue.

#### /karaoke join

Join the queue.

#### /karaoke duet

Join the queue as a duet.

| Option  | Required | Description                |
| ------- | :------: | :------------------------- |
| Partner |    ✓     | The partner for your duet. |

#### /karaoke leave

Leave the queue.

#### /karaoke queue

Show the current queue.

#### /karaoke help

Show info about karaoke commands.

### Manage <Badge type='tip' text='Slash' />

Create, end, or manage events.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `Mute Members`, `Move Members`, `Manage Channels`.
:::

#### /manage karaoke start

Start a karaoke event.

| Option        | Required | Description                                                                |
| ------------- | :------: | :------------------------------------------------------------------------- |
| Voice channel |    ✓     | The stage or voice channel for the karaoke event.                          |
| Text channel  |    ✓     | The channel to show queue rotations and instructions.                      |
| Topic         |    ✕     | If it's a stage channel, the topic of the stage (default: "Karaoke Event") |
| Role          |    ✕     | The role to ping for the event.                                            |

#### /manage karaoke schedule

Schedule a karaoke event.

| Option        | Required | Description                                           |
| ------------- | :------: | :---------------------------------------------------- |
| Discord event |    ✓     | The Discord event that the karaoke event will be for. |
| Text channel  |    ✓     | The channel to show queue rotations and instructions. |
| Role          |    ✕     | The role to ping for the event.                       |

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

Remove a user from a karaoke queue.

| Option | Required | Description                        |
| ------ | :------: | :--------------------------------- |
| Event  |    ✓     | The event to remove the user from. |
| User   |    ✓     | The user to remove.                |

#### /manage karaoke menu

Open the menu to manage karaoke events.

More info about managing events can be found [here](/events/karaoke#managing-events).

## Moderation Commands

### Anti-Hoist <Badge type='tip' text='Slash' />

Prevent usernames that place the user to the top of the member list.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `Manage Nicknames`.
:::

#### /antihoist toggle

Enable or disable anti-hoist.

| Option | Required | Description                                                 |
| ------ | :------: | :---------------------------------------------------------- |
| Value  |    ✓     | True: anti-hoist is enabled. False: anti-hoist is disabled. |

#### /antihoist settings

Show the current settings.

### Minage <Badge type='tip' text='Slash' />

Set a minimum required account age for users to join the server.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `Kick Members`.
:::

#### /minage set

Set the account age requirements and kick message.

The `response` option can be formatted with variables which are listed [here](/moderation/minage#message-variables).

| Option   | Required | Description                                                               |
| -------- | :------: | :------------------------------------------------------------------------ |
| Days     |    ✕     | New users below the set amount of days will be kicked and sent a message. |
| Response |    ✕     | Message to be sent on kick.                                               |

#### /minage unset

Unset the current settings.

| Option   | Required | Description                        |
| -------- | :------: | :--------------------------------- |
| Days     |    ✕     | Reset the required days to 0.      |
| Response |    ✕     | Reset the kick message to default. |

#### /minage test

Test the minage message.

#### /minage toggle

Enable or disable minage.

| Option | Required | Description                                                 |
| ------ | :------: | :---------------------------------------------------------- |
| Value  |    ✓     | True: the module is enabled. False: The module is disabled. |

#### /minage settings

Show the current settings.

### Moderation <Badge type='tip' text='Slash' />

Edit the settings of the moderation module.

#### /moderation set

Set new moderation module settings.

| Option         | Required | Description                     |
| -------------- | :------: | :------------------------------ |
| Report channel |    ✕     | The channel to send reports to. |

#### /moderation unset

Reset moderation module settings.

| Option         | Required | Description                       |
| -------------- | :------: | :-------------------------------- |
| Report channel |    ✕     | Unset the current report channel. |

#### /moderation permissions

Audit the bot's permissions for moderation features.

#### /moderation toggle

Enable or disable the moderation module.

| Option | Required | Description                                                 |
| ------ | :------: | :---------------------------------------------------------- |
| Value  |    ✓     | True: the module is enabled. False: The module is disabled. |

#### /moderation settings

Show the current settings.

### Report <Badge type='tip' text='Context-Menu - Message' />

Send the reported message to the set moderator channel.

You can check out [this](/moderation/report) page to see info about how it works.

### User <Badge type='tip' text='Slash' />

Get info on a user.

| Option | Required | Description                                     |
| ------ | :------: | :---------------------------------------------- |
| User   |    ✓     | The user or the ID of the user to get info for. |

## Notification Commands

### YouTube <Badge type='tip' text='Slash' />

Add, remove, or edit YouTube subscriptions.

::: danger Supported channels
The only supported channels are the ones that are listed on [Holodex](https://holodex.net/channel?org=All%20Vtubers).
:::

#### /youtube subscribe

Subscribe to a new channel.

| Option  | Required | Description                                                                                                                                            |
| ------- | :------: | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account |    ✓     | Search the name of the channel and get an autocompleted list. Only channels on [Holodex](https://holodex.net/channel?org=All%20Vtubers) are supported. |

#### /youtube unsubscribe

Unsubscribe from a channel.

| Option       | Required | Description                                  |
| ------------ | :------: | :------------------------------------------- |
| Subscription |    ✓     | The YouTube subscription you want to remove. |

#### /youtube set

Set YouTube notification settings.

| Option         | Required | Description                                               |
| -------------- | :------: | :-------------------------------------------------------- |
| Subscription   |    ✓     | The YouTube subscription you want to change settings for. |
| Message        |    ✕     | The message for the notification.                         |
| Channel        |    ✕     | The channel to send notifications to.                     |
| Role           |    ✕     | The role to ping for notifications.                       |
| Member channel |    ✕     | The channel to send member notifications to.              |
| Member role    |    ✕     | The role to ping for member notifications.                |

#### /youtube unset

Unset YouTube notification settings.

| Option         | Required | Description                                               |
| -------------- | :------: | :-------------------------------------------------------- |
| Subscription   |    ✓     | The YouTube subscription you want to change settings for. |
| Message        |    ✕     | Reset the notification message to default.                |
| Channel        |    ✕     | Remove the channel that notifications are sent to.        |
| Role           |    ✕     | Remove the ping role.                                     |
| Member channel |    ✕     | Remove the channel that member notifications are sent to. |
| Member role    |    ✕     | Remove the member ping role.                              |

#### /youtube role_reaction

Automatically handle role reactions for YouTube subscriptions.

| Option  | Required | Description                                     |
| ------- | :------: | :---------------------------------------------- |
| Channel |    ✓     | The channel to send the role reaction embed to. |

#### /youtube toggle

Enable or disable the YouTube module.

| Option | Required | Description                                                 |
| ------ | :------: | :---------------------------------------------------------- |
| Value  |    ✓     | True: the module is enabled. False: The module is disabled. |

#### /youtube subscriptions

Show the current YouTube subscriptions.

## Utility Commands

### Add Emote <Badge type='tip' text='Context-Menu - Message' />

Adds the image attachment, link, or emoji that is in the message.

Priority is `emoji > attachment > link`.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `Manage Emojis and Stickers`.
:::

### Discord Status <Badge type='tip' text='Slash' />

Get updates about Discord outages sent to a channel.

#### /discordstatus set

Set the channel to send notifications to.

| Option  | Required | Description                            |
| ------- | :------: | :------------------------------------- |
| Channel |    ✓     | The channel to send status updates to. |

#### /discordstatus unset

Unset the current channel.

#### /discordstatus settings

Show the current settings.

### Emote Credits <Badge type='tip' text='Slash' />

Send emote credits to a channel.

#### /emotecredits add

Add a new emote credit entry.

| Option | Required | Description                             |
| ------ | :------: | :-------------------------------------- |
| Emote  |    ✓     | The ID of the emote to add credits for. |

#### /emotecredits set

Set a new emote credits channel.

| Option  | Required | Description                           |
| ------- | :------: | :------------------------------------ |
| Channel |    ✓     | The channel to send emote credits to. |

#### /emotecredits unset

Reset the emote credits channel.

#### /emotecredits settings

Show the current settings.

### Poll <Badge type='tip' text='Slash' />

Create, end, or manage polls.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`.
:::

#### /poll create

Create a poll. There must be at least 2 options.

| Option    | Required | Description                        |
| --------- | :------: | :--------------------------------- |
| Question  |    ✓     | The question or topic of the poll. |
| Time      |    ✓     | Time the poll will run for.        |
| Option 1  |    ✓     | The poll's first option.           |
| Option 2  |    ✓     | The poll's second option.          |
| Option 3  |    ✕     | The poll's third option.           |
| ...       |   ...    | ...                                |
| Option 10 |    ✕     | The poll's tenth option.           |

#### /poll menu

Show the menu for managing polls.

### Utility <Badge type='tip' text='Slash' />

Edit the settings of the utility module.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`, `Embed Links`.
:::

#### /utility toggle

Enable or disable the utility module.

| Option | Required | Description                                                 |
| ------ | :------: | :---------------------------------------------------------- |
| Value  |    ✓     | True: the module is enabled. False: The module is disabled. |

#### /utility settings

Show the current settings.

## Welcome Commands

### Welcome <Badge type='tip' text='Slash' />

Edit the settings of the welcome module.

#### /welcome set

Set welcome module settings.

| Option      | Required | Description                              |
| ----------- | :------: | :--------------------------------------- |
| Channel     |    ✕     | The channel to send welcome messages to. |
| Message     |    ✕     | The content of the message.              |
| Title       |    ✕     | The title of the embed.                  |
| Description |    ✕     | The description of the embed.            |
| Image       |    ✕     | The image to use for the embed.          |
| Color       |    ✕     | The color of the embed.                  |

#### /welcome unset

Reset welcome module settings.

| Option      | Required | Description                                     |
| ----------- | :------: | :---------------------------------------------- |
| Channel     |    ✕     | Unset the current welcome channel.              |
| Message     |    ✕     | Unset the current welcome message.              |
| Title       |    ✕     | Unset the current the title of the embed.       |
| Description |    ✕     | Unset the current the description of the embed. |
| Image       |    ✕     | Unset the current the image.                    |
| Color       |    ✕     | Unset the current the color of the embed.       |

#### /welcome test

Test the welcome message.

#### /welcome toggle

Enable or disable the welcome module.

| Option | Required | Description                                                 |
| ------ | :------: | :---------------------------------------------------------- |
| Value  |    ✓     | True: the module is enabled. False: The module is disabled. |

#### /welcome settings

Show the current settings.
