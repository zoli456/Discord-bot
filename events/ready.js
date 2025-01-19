/**
 *
 * @param {import("../lib/DiscordMusicBot")} client
 */
module.exports = async (client) => {
  //client.manager.init(client.user.id);
  await client.manager.init(client.user.id);
  client.user.setPresence(client.config.presence);
  client.log("Successfully Logged in as " + client.user.tag);
  await client.ServiceChannels();
  await client.setup_feeds();
  await client.load_polls();
  client.setup_twitch();
  client.setup_youtube();
  await client.reactionRole.init(client);
};
