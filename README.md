<div align="center">

# KBot

[![Discord Shield](https://discordapp.com/api/guilds/953375922990506005/widget.png)](https://kbot.ca/discord)
[![Uptime Kuma](https://status.kbot.ca/api/badge/8/status?upLabel=online&downLabel=offline&label=Bot+status)](https://status.kbot.ca/status/kbot)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/b1a776ba1a064d34a1886e3c74c0cada)](https://www.codacy.com/gh/KBot-discord/KBot/dashboard?utm_source=github.com&utm_medium=referral&utm_content=KBot-discord/KBot&utm_campaign=Badge_Grade)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FKBot-discord%2FKBot.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FKBot-discord%2FKBot?ref=badge_shield)

### A multi-purpose Discord bot using [Sapphire](https://www.sapphirejs.dev/) and [discord.js](https://discord.js.org).

</div>

## Features ⚙️

- Stream notifications for your favourite VTubers.
- Utilities such as poll creation and getting notifications about Discord service incidents.
- Welcome messages whenever a new user joins your server.
- Prevent users under a certain account age from joining.

A fill list of features can be found in the [documentation](https://docs.kbot.ca/).

## Project structure 📚

- `/apps`
  - `/apps/bot` - Discord bot
  - `/apps/discord-incident` - Service to send alerts about Discord incidents
  - `/apps/docs` - Documentation for the bot
  - `/apps/web` - Dashboard to edit bot settings
- `/k8s` - Kubernetes configuration files for infrastructure
- `/packages` - Shared packages
- `/protos` - Protobuf files

## Links 🔗

- [Bot invite](https://discord.com/api/oauth2/authorize?client_id=918237593789947925&permissions=1376425339926&scope=bot)
- [Dashboard](https://kbot.ca/)
- [Documentation](https://docs.kbot.ca/)
- [Status page](https://status.kbot.ca/)
- [Support server](https://kbot.ca/discord)

## Development requirements 🔧

- [Node.js](https://nodejs.org/en/), [yarn](https://yarnpkg.com/), and [Golang](https://go.dev/)
- [Docker](https://www.docker.com/community-edition)
- [Buf](https://github.com/bufbuild/buf)
- [Redis](https://redis.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Meilisearch](https://www.meilisearch.com/)
- [Task](https://github.com/go-task/task)

## Contributing 💻

See the [contribution guide](/.github/CONTRIBUTING.md) for how to contribute.

## Donations ☕

Any support helps immensely. Everything received goes back into the development and hosting of the bot. Thank you!

<a href='https://ko-fi.com/killbasa' target='_blank'><img style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com'></a>

## Contributors ✨

Thank you to all contributors!

Definitions for each emoji can be found [here](https://allcontributors.org/docs/en/emoji-key).

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
