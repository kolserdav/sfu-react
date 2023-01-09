# UI Tests

## Manual tests

Open the application page, click on the button create a room. When the connection is established, open a new room tab, with the previously added parameter url `?uid=unique_unit_id` (with NODE_ENV=development `uid` is added to the address automatically when you click on the "Copy room address" button). This way you will get a simulation of connecting two clients to a room.

## Automatic tests

1. Copy file [tests/rooms.example.json](../tests/rooms.example.json) to file `../tests/rooms.json`
2. Set up file `../tests/rooms.example.json`
3. Run test script:

On local machine (_the server and client will be started automatically for the duration of the test_):

```sh
npm run test
```

On a remote server:

```sh
npm run test:remote
```
