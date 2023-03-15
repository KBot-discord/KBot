# Manage <Badge type='tip' text='Slash' />

Create or manage ongoing events.

::: tip Required bot permissions
KBot needs these permissions for the command to run: `View Channel`, `Send Messages`,
`Embed Links`, `Manage Events`, `Mute Members`, `Move Members`, `Manage Channels`.
:::

## /manage karaoke start

Start a karaoke event.

| Option        | Required | Description                                         |
|---------------|:--------:|:----------------------------------------------------|
| Voice channel |    ✓     | Choose the channel for the karaoke event.           |
| Text channel  |    ✓     | Channel to show queue rotations and instructions.   |
| Topic         |    ✕     | Name for the stage event (default: "Karaoke Event") |
| Role          |    ✕     | Role to ping for the event.                         |

## /manage karaoke schedule

Schedule a karaoke event.

| Option        | Required | Description                                           |
|---------------|:--------:|:------------------------------------------------------|
| Discord event |    ✓     | The Discord event that the karaoke event will be for. |
| Text channel  |    ✓     | Channel to show queue rotations and instructions.     |
| Role          |    ✕     | Role to ping for the event.                           |

## /manage karaoke stop

Stop a karaoke event.

| Option | Required | Description        |
|--------|:--------:|:-------------------|
| Event  |    ✓     | The event to stop. |

## /manage karaoke add

Add a user to a karaoke queue.

| Option | Required | Description                   |
|--------|:--------:|:------------------------------|
| Event  |    ✓     | The event to add the user to. |
| User   |    ✓     | The user to add.              |

## /manage karaoke remove

Remove a user to a karaoke queue

| Option | Required | Description                        |
|--------|:--------:|:-----------------------------------|
| Event  |    ✓     | The event to remove the user from. |
| User   |    ✓     | The user to remove.                |

## /manage karaoke menu

Open the karaoke menu
