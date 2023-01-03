# Contributing

## Setup

### 1. Fork and clone the repository
```bash
# After forking the repository, copy its url and run:
$ git clone https://gitlab.com/[USERNAME]/kbot.git
$ cd kbot
```

### 2. Create and configure the .env file
```bash
# populate each of the values
$ cp .env.example .env
$ nano .env
```

### 3. Install dependencies
```bash
$ yarn install
```

### 4. Build project
```bash
$ yarn build
```

### 5. Start coding (make sure to run `yarn lint` and `yarn format` occasionally)

### 6. Open a pull request with your changes.


## Using Docker

For quickly spinning up a development environment, you can run the following `docker-compose.yml` file to get all the required services up and running.

After copying the file into the project directory, you can run it with `docker-compose up -d`.

```yml
# docker-compose.yml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    container_name: postgres
    ports:
      - "127.0.0.1:5432:5432"
    environment:
      POSTGRES_DB: kbot-dev
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "127.0.0.1:6379:6379"
    command: /bin/sh -c "redis-server --requirepass $$REDIS_PASS"
    env_file:
      - ../.env
```

```bash
# resulting development .env values for KBot
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASS=password
DATABASE_URL=postgresql://user:password@localhost:5432/kbot-dev
```
