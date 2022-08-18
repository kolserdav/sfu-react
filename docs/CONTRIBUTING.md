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

- Run migrations to database:

```sh
npm run db
```

then set up `packages/server/.env` and `packages/client/.env` files

---

## Start

Start on development mode:

```sh
npm run dev
```
