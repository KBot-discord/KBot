---
title: Emote Credits
---

# Emote Credits

It's not uncommon to credit artists when adding emote to your server.
However, it's not easy creating or keeping all of the info update to date.
This feature provides an easy solution to that.

::: tip Required channel permissions
KBot needs these permissions in the set channel to be able to send messages: `View Channel`, `Send Messages`, `Embed Links`.
:::

## Setup

To enable emote credits, set a channel with [/emotecredits set](/commands#emotecredits-set).

## Disabling credits

To disable emote credits, just remove the set channel with [/emotecredits unset](/commands#emotecredits-unset).

## Adding credits

### For new emotes

For emotes that you need to add to the server, you can use [Add Emote](/commands#add-emote) which provides you a button to create the credits entry.

### For existing emotes

For emotes that have already been uploaded to the server, you'll need to get the ID of the emote and then use [/emotecredits add](/commands#emotecredits-add).

To get the ID of an emote, all you need to do is enter a `\` and then the emote. The result of this will look like `\<:blank:1089252121871917149>`.
What you want from that result is the number, which is the emote's ID.

## Editing credits

To edit credits, all you need to do is click the `Edit info` button on the entry. This will bring up a modal where you can edit the info.

## Refresing the emote name

Since the credit entry won't be able to know if you change the emote name, all you need to do to refresh it is press the `Refresh emoji` button.
