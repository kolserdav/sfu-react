# Stun turn server

For deploy self stun/turn server recomended use [`coturn/coturn`](https://github.com/coturn/coturn) library. You can use other solutions, but since the project is tested with `coturn`, here is a brief instruction on how to set it up.

## Installation

---

Find a binary mirror with `coturn` for your OS or build it manually

---

### Set up

- Make backup of old config coturn config file

```sh
cp /etc/coturn/turnserver.conf /etc/coturn/turnserver.backup.conf
```

- Set up the config file like example [resources/coturn.conf](resources/coturn.conf)

### Start

```sh
systemctl start coturn
```

### Expected Behavior

If `coturn` is working correctly and `iceServers` is correct in the component, then there should be a connection with remote devices and there should be no errors associated with `STUN` and `TURN` in the console
