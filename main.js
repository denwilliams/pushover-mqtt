#!/usr/bin/env node

const got = require("got");
const mqttusvc = require("mqtt-usvc");

const PUSHOVER_URL = "https://api.pushover.net/1/messages.json";

async function main() {
  const service = await mqttusvc.create();
  service.on("message", (topic, data) => {
    const [, action, key, dataType] = topic.split("/");

    if (action !== "send") return;

    const target = service.config.targets.find(t => t.key === key);
    if (!target) return;

    let message = "";
    let title = target.title || undefined;
    let url = undefined;

    if (dataType === "text") {
      message = data;
    } else if (dataType === "message") {
      message = data.message;
      title = data.title || title;
      url = data.url;
    }

    got
      .post(PUSHOVER_URL, {
        body: {
          token: target.api_token,
          user: target.user_key,
          message,
          title,
          url
          // attachment: image attachment
          // url_title, priority, sound, timestamp
        },
        json: true
      })
      .then(() => {
        console.log("OK -> " + message);
      })
      .catch(err => console.error("Pushover error -> " + err));
  });

  service.config.targets.forEach(t => {
    service.subscribe("~/send/" + t.key + "/text");
    service.subscribe("~/send/" + t.key + "/message");
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
