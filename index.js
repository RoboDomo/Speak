process.env.DEBUG = "speak";

const debug = require("debug")("speak"),
  say = require("say"),
  mqtt = require("mqtt"),
  uri = `mqtt://${process.env.MQTT_HOST}`,
  client = mqtt.connect(uri);

process.once("SIGHUP", async () => {
  console.log("SIGHUP event");
  await speak("speak done");
  process.exit(1);
});

process.once("SIGTERM", async () => {
  console.log("SIGTERM event");
  await speak("speak done");
  process.exit(1);
});

process.on("exit", async code => {
  console.log("exit event");
  await speak("speak done");
});

process.on("beforeExit", async code => {
  console.log("beforeExit event");
  await speak("speak done");
});

const queue = [];

const run_queue = async () => {
  while (queue.length) {
    const message = queue.pop();
    debug("saying ", message);
    await speak(message);
  }
};

const speak = async text => {
  return new Promise((resolve, reject) => {
    say.speak(text, null, null, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const queue_message = async message => {
  queue.push(message.toString());
  if (queue.length == 1) {
    run_queue();
  }
};

client.on("connect", async () => {
  debug("connected");
  client.subscribe("say");
  queue_message("Speak ready");
});

client.on("message", async (topic, message) => {
  debug("topic", topic, "message", message.toString());
  queue_message(message.toString());
});

client.on("error", e => {
  debug("error", e);
});
