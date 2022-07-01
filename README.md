# uyem

Selective Forwarding Unit (SFU) web application library, server side of which written on Node and client side on ReactJS.

## Installation

- Install source:

```sh
npm i uyem --omit=optional
```

## Settings

- To be able to create connections on a host other than localhost, you need to connect SSL certificates.

---

Sample setup SSL certificates from Let's Encrypt for client and for server together with `nginx` [SSL.md](./SSL.md)

---

- To remote access between units using valid `iceServers` is required:

---

```javascript
const iceServers = [
  {
    urls: ['stun:127.0.0.1:3478'],
  },
  {
    urls: ['turn:127.0.0.2:3478'],
    username: 'username',
    credential: 'password',
  },
];
```

See [docs/COTURN.md](docs/COTURN.md) for more details.

---

## Run server

- Add property `server` to the `scripts` block of `package.json`:

```json
"server": "uyem --port 3001",
```

- Run server:

```sh
npm run server
```

## Include examples

- [Client Hello World](examples/hello-world/src/App.jsx)
- [Server](examples/server/index.js)
