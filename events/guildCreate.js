const fs = require("fs");
const { JsonDB, Config } = require("node-json-db");
module.exports = async (client, guild) => {
  client.log(`The bot joined to a new server! ${guild.name}(${guild.id}).`);
  const settings_db = new JsonDB(
    new Config("./db/" + guild.id, true, true, "/"),
  );
  await settings_db.push("/language", "en");
  client.guild_settings.push({
    guildId: guild.id,
    settings_db: settings_db,
  });
};
