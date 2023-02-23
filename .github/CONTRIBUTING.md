# Contributing

## Setup

### 1. Fork and clone the repository
```bash
# After forking the repository, copy the url and run:
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

### 4. Run code generation
```bash
$ yarn prepare
```

### 5. Build project
```bash
$ yarn build
```

### 5. Start coding (make sure to run `yarn lint` and `yarn format` occasionally)

### 6. Open a pull request with your changes.


## Using Docker
For quickly spinning up a development environment, you can run the `docker-compose.dev.yml` file after creating the network.

### 1. Create the network
```bash
$ docker network create KBot-network
```

### 2. Populate the .env values
```bash
# resulting development .env values for KBot
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASS=password
DATABASE_URL=postgresql://user:password@localhost:5432/kbot
```

### 3. Start the containers
```bash
$ docker compose -f docker-compose.dev.yml up -d
```
