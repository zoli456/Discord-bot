import fs from 'fs';
import schedule from 'node-schedule';

export default async (client, guild) => {
  client.log(`The bot left from a server! ${guild.name}(${guild.id}).`);
  const guild_settings_pos = client.guild_settings.map((e) => e.guildId).indexOf(guild.id);
  const setttings_db = await client.guild_settings[guild_settings_pos].settings_db.getData("/");
  if (setttings_db.counter_channel) {
    let current_job = schedule.scheduledJobs[`${guild.id}_counter`];
    if (current_job) {
      current_job.cancel();
    }
  }
  if (setttings_db.gamestat_channel) {
    let current_job = schedule.scheduledJobs[`${guild.id}_gamestat`];
    if (current_job) {
      current_job.cancel();
    }
  }
  if (setttings_db.countdown_channel) {
    let current_job = schedule.scheduledJobs[`${guild.id}_countdown`];
    if (current_job) {
      current_job.cancel();
    }
  }
  if (setttings_db.nameday_channel) {
    const index = client.nameday_channels.indexOf(setttings_db.nameday_channel.nameday_channel_id);
    if (index > -1) {
      client.nameday_channels.splice(index, 1);
    }
  }
  let temp = setttings_db.temp_channel;
  if (temp) {
    client.tempChannelsmanager.unregisterChannel(temp.temp_channel_id);
  }
  if (setttings_db.word_game) {
    const word_game_pos = client.wordgame_status.map((e) => e.guildId).indexOf(guild.id);
    if (word_game_pos !== -1) {
      client.wordgame_status.splice(word_game_pos, 1);
    }
    if (fs.existsSync(`./info/wordgame/${guild.id}_wordgame.json`)) {
      fs.unlinkSync(`./info/wordgame/${guild.id}_wordgame.json`);
    }
  }
  client.feed_list = client.feed_list.filter((x) => x.guild_id !== guild.id);
  client.twitch_list = client.twitch_list.filter((x) => x.guild_id !== guild.id);
  for (let i = 0; i < client.youtube_list.length; i++) {
    if (client.youtube_list[i].guild_id === guild.id) {
      client.youtube_notifier.unsubscribe(client.youtube_list[i].youtube_id);
      client.youtube_list.splice(i, 1);
    }
  }

  if (guild_settings_pos !== -1) {
    client.guild_settings.splice(guild_settings_pos, 1);
  }
  if (fs.existsSync("./db/" + guild.id + ".json")) {
    fs.unlinkSync("./db/" + guild.id + ".json");
  }
  const player = client.manager.getPlayer(guild.id);
  if (player) player.destroy();
};
