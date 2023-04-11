<div align="center">

# Discord bot

</div>

## Dev environment

To set up a dev environment, check out the [contribution guide](../../.github/CONTRIBUTING.md).

## Developing

First, install the npm packages:

```bash
yarn install
```

Then you'll need to build it's dependencies using [Turborepo](https://turbo.build/):

```bash
yarn build:bot
```

Once those two commands are run, you can start the bot in watch mode:

```bash
yarn dev
```

## Docker

To build a docker image of the application, run this in the root of the repository:

```bash
docker buildx build -t kbot/bot -f .apps/bot/Dockerfile .
```
