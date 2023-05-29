# Contributing

## Setup

### 1. Fork and clone the repository

```bash
# After forking the repository, copy the url and run:
$ git clone https://gitlab.com/[USERNAME]/kbot.git
$ cd kbot
```

### 2. Create and configure the .env files

```bash
$ cp apps/bot/.env.example apps/bot/.env
$ cp apps/web/.env.example apps/web/.env
```

### 3. Install dependencies

```bash
$ yarn install
```

### 4. Build project

```bash
$ yarn build
```

### 5. Start coding (make sure to run `yarn lint` and `yarn format` occasionally).

### 6. Open a pull request with your changes.

---

## Using devcontainers (VSCode)

Using devcontainers allows you to quickly setup a dev environment and you dont need to manually start the required services. PostgreSQL, Redis, and Meilisearch will be started automatically.

### 1. Customizing the environment

If you wish to customize your devcontainers environment with your dotfiles,
you can set the `DOTFILES_REPO` environment variable with your dotfiles reportsitory URL. This will run any install script in your dotfiles repo and apply it to the container.

### 2. Build the environment

Open the command palette and select `Dev Containers: Rebuild and Reopen in Container`.
This will build the `Dockerfile` in `.devcontainer/` along with the settings in `devcontainer.json` and `docker-compose.workspace.yml`.

---

## Using Docker

For quickly spinning up a development environment, you can run the `docker-compose.dev.yml` file after creating the network.

### 1. Create the network

```bash
$ docker network create KBot-network
```

### 2. Populate the .env values

```bash
# apps/bot/.env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASS=password
DATABASE_URL=postgresql://user:password@localhost:5432/kbot
MEILI_HOST=127.0.0.1
MEILI_PORT=7700
MEILI_APIKEY=password
```

### 3. Start the containers

```bash
$ docker compose -f apps/bot/docker-compose.dev.yml up -d
```
