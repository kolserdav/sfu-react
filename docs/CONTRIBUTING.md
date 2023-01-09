# Contributing

Instruction of run project in development mode

## Installation

- Clone repository

```sh
git clone https://github.com/kolserdav/werift-sfu-react.git
cd werift-sfu-react
```

- Run database via `docker-compose` [optional if you system have `mysql` database (but required create database like DATABASE_URL in `packages/server/.env`)]:

```sh
docker-compose up -d
```

- Install dependencies

```sh
npm i
```

## Settings

- At first run need set up `.env` files, for fast copy run:

```sh
npm run env
```

then set up `packages/server/.env` and `packages/client/.env` files

- Run migrations to database:

```sh
npm run db
```

---

## Start

Start on development mode:

```sh
npm run dev
```

## Development for tests

Config examples:

- [Nginx client](./resources/nginx.client.conf)
- [Nginx server](./resources/nginx.server.conf)
- [Coturn config](./resources/coturn.conf)

SSL certificate is required [./SSL.md](./SSL.md)

---

Build server:

```sh
npm run build:server
```

Build client:

```sh
npm run build:client-react
```

---

`or` build server and client:

```sh
npm run build:react
```

---

Start on production:

```sh
npm run start
```

### Tests

See file [docs/TESTS.md](./TESTS.md)
