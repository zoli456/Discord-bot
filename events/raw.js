/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {*} data
 */
module.exports = (client, data) => {
  client.manager.sendRawData(data);
};
