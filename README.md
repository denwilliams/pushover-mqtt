# pushover-mqtt
Relay messages from MQTT to Pushover

**Breaking change in 0.3. `api_token` is now just `token`, and `user_key` just `user` to match the Pushover fields and documentation.**

## Topics

With a configured prefix of `pushover`, the following topics can be used:

- pushover/{target}/send/text
- pushover/{target}/send/message

Where `target` is the `key` of a target defined in configuration. Target configuration should contain at least `token` and `user`, but can contain any field defined here: https://pushover.net/api

`text` accepts a string payload which will be passed on as the message body to Pushover.

`message` accepts an object with any valid API field. These fields merge with the values in the target, so you can essentially define "default" values in the target, and override them in each message. Example fields include:

1. title (optional) - defaults to `target.title` if not provided
2. message (required)
3. url (optional)

Full list of fields available are: https://pushover.net/api

Examples:

- Topic: `pushover/send/jack/text`
- Payload: `Hi Jack!`

- Topic: `pushover/send/jack/message`
- Payload: `{"title":"Hello","message":"How are you?"}`

## Running

It is intended to be installed globally, ie `npm i -g pushover-mqtt`

Create a YAML file somewhere. See `config.example.yml`

You will need to define at least 1 target in the config.

Run (replace path)

```
CONFIG_PATH=/path/to/myconfig.yml pushover-mqtt
```

You can also use Consul for config. See [mqtt-usvc](https://www.npmjs.com/package/mqtt-usvc) for more details.

## Example Config

```yml
mqtt:
  uri: mqtt://localhost
  prefix: pushover
service:
  targets:
    # Will allow sending on pushover/send/myapp/text and pushover/send/myapp/message
    - key: myapp
      token: "setme"
      user: "setme"
      title: "My App"
```
