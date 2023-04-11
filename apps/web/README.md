<div align="center">

# Dashboard

</div>

## Dev environment

To set up a dev environment, check out the [contribution guide](../../.github/CONTRIBUTING.md).

## Developing

To install the application's dependencies:

```bash
yarn install
```

Build the dependencies using [Turborepo](https://turbo.build/):

```bash
yarn build:web
```

To start a development server:

```bash
yarn dev
```

## Building

To create a production version of your app:

```bash
yarn build
```

You can preview the production build with `yarn preview`.

## Docker

To build a docker image of the application, run this in the root of the repository:

```bash
docker buildx build -t kbot/web -f .apps/web/Dockerfile .
```
