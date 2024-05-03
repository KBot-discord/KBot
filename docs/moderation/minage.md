---
title: Minage
---

# Minage

Require users joining your server to have a certain account age.

::: tip Required bot permissions
KBot needs these permissions in order for Minage to function: `Kick Members`.
:::

## Setup

Set the required age (in days) and kick message with [/minage set](/commands#minage-set).

Once you have made sure that the bot has the `Kick Members` permission, you can enable the feature with [/minage toggle](/commands#minage-toggle).

## Message variables

The possible message variables and their descriptions are listed below.

| Variable   | Description                                            |
| ---------- | :----------------------------------------------------- |
| `{server}` | The name of the server.                                |
| `{req}`    | The required amount of days.                           |
| `{days}`   | The amount of days until the user can join the server. |
| `{date}`   | The date on which the user can join the server.        |

### Examples

| Text                                                                                   | Result                                                                              |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| You have been kicked from `{server}` because your account is under `{req}` day(s) old. | You have been kicked from KBot Support because your account is under 30 day(s) old. |
| Your account is under `{req}` day(s) old. Please join in `{days}` or on `{date}`.      | Your account is under 30 day(s) old. Please join in 15 day(s) or on 03/04/2023.     |
