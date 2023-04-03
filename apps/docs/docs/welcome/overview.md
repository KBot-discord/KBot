---
title: Welcome
---

# Welcome

Welcome new users to the server by sending a welcome message to a channel whenever they join.

::: tip Required channel permissions
KBot needs these permissions in the set channel to be able to send messages: `View Channel`, `Send Messages`, `Embed Links`.
:::

## Setup

To setup welcome messages, use [/welcome set](/commands#welcome-set).

Once you have made sure that the bot has required permissions in the set channel, you can enable the feature with [/welcome toggle](/commands#welcome-toggle).

## Testing messages

In order to see what the welcome message looks like before any users join, use [/welcome test](/commands#welcome-test).

## Message variables

The possible message variables and their descriptions are listed below.

| Variable      | Description                                       |
| ------------- | :------------------------------------------------ |
| `{nl}`        | This adds a new line to the text.                 |
| `{@member}`   | To @ them.                                        |
| `{membertag}` | The username and tag of the user (ie. KBot#7091). |
| `{server}`    | The name of the server.                           |

### Examples

| Text                                                                          | Result                                                                      |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Welcome to `{server}`, `{membertag}`! Please take a moment to read the rules. | Welcome to KBot Support, KBot#7091! Please take a moment to read the rules. |
