# Server start instruction as systemd daemon

- Create file `/etc/systemd/system/uyem.service`
- Set up file as example [resources/server.service](./resources/server.service)
- Reload daemons

```sh
systemctl daemon-reload
```

- Start server service

```sh
systemctl start uyem
```

## Enable

```sh
systemctl enable uyem
```

## Logs

```sh
journalctl -u uyem -e
```

## Expected Behavior

The server is running and there are no errors in the logs
