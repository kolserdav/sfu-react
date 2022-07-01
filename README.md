## Installation

- Install source:

```sh
npm i uyem --omit=optional
```

## Settings

- To be able to create connections on a host other than localhost, you need to connect SSL certificates.

---

Sample setup SSL certificates from Let's Encrypt for client and for server together with `Nginx` [./SSL.md](./SSL.md)

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

- Add the script to `package.json` of project:

```json
"server": "uyem --port 3002",
```

- Run uyem server:

```sh
npm run server
```

## Examples

- [Client](examples/hello-world/src/App.jsx)
- [include server](examples/server/index.js)
