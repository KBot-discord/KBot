---
title: YouTube
---

# YouTube

Have YouTube stream notifications sent to a channel in your server.

::: danger Supported channels
The only supported channels are the ones that are listed on Holodex, which can be found here: https://holodex.net/channel?org=All%20Vtubers.
:::

## Subscribing to a channel

To subscribe to a YouTube channel, use [/youtube subscribe](/commands#youtube-subscribe).

The list of channel names that pop up use **autocomplete**, so simply search for the channel name you wish to subscribe to and select it.
Entering an ID which is not listed will result in an error.

## Unsubscribing from a channel

To unsubcribe from a channe, use [/youtube unsubscribe](/commands#youtube-unsubscribe).

The shown list is generated from your current YouTube subscriptions.

## Role reactions

Setting up role reactions is generally a pain.
As such, KBot has a feature to automatically keep track of which of your subscriptions have a role set and then create a role reaction message from that.

To set this up, all you need to run is [/youtube role_reaction](/commands#youtube-role-reaction).
