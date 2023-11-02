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
  - `/apps/docs` - Documentation for the bot
  - `/apps/web` - Dashboard to edit bot settings
- `/packages` - Shared packages
- `/protos` - Protobuf files

## Links 🔗

- [Bot invite](https://discord.com/api/oauth2/authorize?client_id=918237593789947925&permissions=1376425339926&scope=bot)
- [Dashboard](https://kbot.ca/)
- [Documentation](https://docs.kbot.ca/)
- [Status page](https://status.kbot.ca/)
- [Support server](https://kbot.ca/discord)

## Development requirements 🔧

- [Node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/community-edition)
- [Buf](https://github.com/bufbuild/buf)
- [Redis](https://redis.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Meilisearch](https://www.meilisearch.com/)

## Contributing 💻

See the [contribution guide](/.github/CONTRIBUTING.md) for how to contribute.

## Donations ☕

Any support helps immensely. Everything received goes back into the development and hosting of the bot. Thank you!

<a href='https://ko-fi.com/killbasa' target='_blank'><img style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com'></a>

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://kbot.ca/"><img src="https://avatars.githubusercontent.com/u/13106700?v=4?s=100" width="100px;" alt="Shane"/><br /><sub><b>Shane</b></sub></a><br /><a href="https://github.com/kbot-discord/kbot/issues?q=author%3Akillbasa" title="Bug reports">🐛</a> <a href="https://github.com/kbot-discord/kbot/commits?author=killbasa" title="Code">💻</a> <a href="#design-killbasa" title="Design">🎨</a> <a href="https://github.com/kbot-discord/kbot/commits?author=killbasa" title="Documentation">📖</a> <a href="#infra-killbasa" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-killbasa" title="Maintenance">🚧</a> <a href="#plugin-killbasa" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/kbot-discord/kbot/pulls?q=is%3Apr+reviewed-by%3Akillbasa" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/apps/renovate"><img src="https://avatars.githubusercontent.com/in/2740?v=4?s=100" width="100px;" alt="renovate[bot]"/><br /><sub><b>renovate[bot]</b></sub></a><br /><a href="#maintenance-renovate[bot]" title="Maintenance">🚧</a> <a href="#tool-renovate[bot]" title="Tools">🔧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/apps/allcontributors"><img src="https://avatars.githubusercontent.com/in/23186?v=4?s=100" width="100px;" alt="allcontributors[bot]"/><br /><sub><b>allcontributors[bot]</b></sub></a><br /><a href="#tool-allcontributors[bot]" title="Tools">🔧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
