import DiscordMusicBot from "./lib/DiscordMusicBot.js";
import { exec } from "child_process";

if (process.env.REPL_ID) {
  console.log("Replit system detected, initiating special `unhandledRejection` event listener.");
  process.on("unhandledRejection", (reason, promise) => {
    promise.catch((err) => {
      if (err.status === 429) {
        console.log(
          "something went wrong whilst trying to connect to discord gateway, resetting...",
        );
        exec("kill 1");
      }
    });
  });
}

const client = new DiscordMusicBot();

console.log("Make sure to fill in the config.js before starting the bot.");

const getClient = () => client;

export default {
  getClient,
};
