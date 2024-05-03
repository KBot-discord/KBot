---
title: Karaoke
---

# Karaoke

Karaoke events allows users to create a queue for singing in a voice or stage channel.

::: tip Required bot permissions
KBot needs these permissions in order for Karaoke events to function: `Mute Members`, `Move Members`, `Manage Channels`.
:::

::: tip Required channel permissions
KBot needs these permissions in the set text channel to be able to send messages: `View Channel`, `Send Messages`, `Embed Links`.
:::

## Starting events

To start an event, use [/manage karaoke start](/commands#manage-karaoke-start).

The provided topic option will only be used if the event is in a stage channel.

## Stopping events

To stop an event, use [/manage karaoke stop](/commands#manage-karaoke-stop).

When selecting an event to end, the list that shows up is the channel name that the event is taking place in. It also uses autocomplete so you don't need to provide anything, just select the corresponding channel.

## Managing events

To manage Karaoke events, use [/manage karaoke menu](/commands#manage-karaoke-menu).

The menu that is brought up will list all the ongoing events, and have buttons to lock and unlock the queue, as well as skipping users in the queue.

## Joining events

To join an event, use [/karaoke join](/commands#karaoke-join) while in the event's channel.

## Duets

To join an event as a duet with another user, use [/karaoke duet](/commands#karaoke-duet) while both users are in the event's channel.

After running that command, the chosen user will be asked if they want to join the queue with you. If they agree to join you will enter the queue as a duet, otherwise the command will exit.

## Leaving events

To leave an event, use [/karaoke leave](/commands#karaoke-leave).

## Checking the queue

To check who is currently in the event queue, use [/karaoke queue](/commands#karaoke-queue).
