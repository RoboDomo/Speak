process.env.DEBUG = "speak";

const debug = require("debug")("speak"),
  say = require("say"),
  mqtt = require("mqtt"),
  uri = `mqtt://${process.env.MQTT_HOST}`,
  client = mqtt.connect(uri);

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

client.on("connect", () => {
  debug("connected");
  client.subscribe("say");
});

client.on("message", async (topic, message) => {
  debug("topic", topic, "message", message.toString());
  try {
    await say.stop();
  } catch (e) {
    //    debug("stop exception", e);
  }
  try {
    await speak(message.toString());
  } catch (e) {
    debug("speak exception", e);
  }
  process.exit(0);
  //  queue.push(message.toString());
  //  if (queue.length == 1) {
  //    run_queue();
  //  }
});

client.on("error", e => {
  debug("error", e);
});

process.once("SIGHUP", function() {
  process.exit(1);
});
