process.env.DEBUG = "speak";

const debug = require("debug")("speak"),
  say = require("say"),
  mqtt = require("mqtt"),
  uri = `mqtt://${process.env.MQTT_HOST}`,
  client = mqtt.connect(uri);

const queue = [];

const run_queue = async () => {
  while (queue.length) {
    await speak(queue.pop());
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
  queue.push(message.toString());
  if (queue.length > 1) {
    run_queue();
  }
});

client.on("error", e => {
  debug("error", e);
});

//const main = async () => {
//  await speak("The garage door is open");
//  await speak("The garage door is closed");
//};

//main();
