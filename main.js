#!/usr/bin/env node

const got = require("got");
const mqttusvc = require("mqtt-usvc");

const PUSHOVER_URL = "https://api.pushover.net/1/messages.json";

async function main() {
  const service = await mqttusvc.create();

  for (const target of service.config.targets) {
    if (target.api_token || target.user_key) {
      console.warn(
        "Configuration contains user_key or api_token. Please rename these to user and token."
      );
    }
  }

  service.on("message", (topic, data) => {
    const [, action, key, dataType] = topic.split("/");

    if (action !== "send") return;

    const target = service.config.targets.find((t) => t.key === key);
    if (!target) return;

    let payload = data;

    if (dataType === "text") {
      payload = { message: data };
    } else if (dataType !== "message") {
      return; // unsupported type
    }

    got
      .post(PUSHOVER_URL, {
        json: {
          ...target,
          ...payload,
        },
      })
      .json()
      .then(() => {
        console.log("OK -> " + message);
      })
      .catch((err) => console.error("Pushover error -> " + err.response));
  });

  service.config.targets.forEach((t) => {
    service.subscribe("~/send/" + t.key + "/text");
    service.subscribe("~/send/" + t.key + "/message");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
