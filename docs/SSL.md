# Instructions for creating SSL certificates for the client and server parts of the application

## Nginx

Install `nginx` for Your OS.

### Settings

- Remove default nginx port 80 listener
- Set up files `/etc/nginx/conf.d/domain.domain.conf` from example [resources/nginx.client.conf](./resources/nginx.client.conf) and `/etc/nginx/conf.d/server.domain.domain.conf` from example [resources/nginx.server.conf](./resources/nginx.server.conf)

## Certbot

Install certbot for Your OS with `nginx` plugin.

### Create ssl certificates

---

Make sure domain.domain and server.domain.domain are in zone DNS and point to public IP of your server.

---

- For client:

```sh
certbot -d domain.domain --nginx
```

- For server:

```sh
certbot -d server.domain.domain --nginx
```

# Expected Behavior

Make sure server is running and your application with included `uyem` is builded.  
For server run example see [SYSTEMD.md](./SYSTEMD.md)

---

When opened in a browser `domain/domain`, the room opens according to the protocol `https` and there are no errors in the console connecting to the server using the protocol `wss`.
