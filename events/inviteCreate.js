const { EmbedBuilder } = require("discord.js");
const moment = require("moment");

module.exports = async (client, invite) => {
  const guildSettings = client.guild_settings.find((e) => e.guildId === invite.guild.id);
  if (await guildSettings.settings_db.exists("/log_channel")) {
    const log_settings = await guildSettings.settings_db.getData("/log_channel");
    const logChannel = client.channels.cache.get(log_settings.log_channel_id);
    const lang = client.localization_manager.getLanguage(guildSettings.settings_db.data.language);
    moment.locale(guildSettings.settings_db.data.language);
    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#ffbf00")
          .setAuthor({
            name: invite.guild.name,
            iconURL: invite.guild.iconURL(),
          })
          .setDescription(
            lang.log_invite_created
              .replace("{u}", `<@${invite.inviterId}>`)
              .replace("{i}", `\`${invite.code}\``),
          )
          .addFields(
            {
              name: lang.valid_until,
              value: invite.expiresTimestamp
                ? `\`${moment(invite.expiresTimestamp).format(lang.time_format)}\``
                : lang.forever,
              inline: true,
            },
            {
              name: lang.max_usages,
              value: invite.maxUses ? invite.maxUses.toString() : lang.infinite,
              inline: true,
            },
          )
          .setTimestamp()
          .setFooter({
            text: invite.inviter.username,
            iconURL: invite.inviter.displayAvatarURL({ dynamic: true }),
          }),
      ],
    });
    moment.locale("en");
  }
};
