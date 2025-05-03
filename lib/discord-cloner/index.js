async function cloneMsg(client, options = {}) {
  if (!options.message)
    throw new TypeError(
      "Clone Failed! You must specify your message when cloning a message (message: message object).",
    );
  if (!options.channel)
    throw new TypeError(
      "Clone Failed! You must specify which channel you want your message to be sent to (channel: channel object).",
    );

  let author = options.message.author.displayName;

  if (options.customAuthor) {
    author = options.customAuthor
      .replace("{guild_name}", options.message.guild.name)
      .replace("{username}", options.message.author.username)
      .replace("{user_id}", options.message.author.id)
      .replace("{guild_id}", options.message.guild.id);
  }
  let message_tosend;
  if (options.customMessage) {
    message_tosend = options.customMessage;
  }
  const webhooks = await options.channel.fetchWebhooks();
  let webhook = webhooks.find((wh) => wh.token && wh.owner.id === client.config.clientId);

  if (!webhook) {
    webhook = await options.channel.createWebhook({
      name: author,
      avatar: options.message.author.displayAvatarURL({
        dynamic: true,
      }),
    });
  }
  // Cloning

  if (options.spoof) {
    if (options.message.content && options.message.content !== "") {
      if (options.message.attachments.size > 0) {
        const attachment = `${options.message.attachments.first()?.url}`;
        if (options.message.embeds) {
          await webhook.send({
            content: `${message_tosend} \n\n${attachment}`,
            embeds: options.message.embeds,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        } else {
          await webhook.send({
            content: `${message_tosend} \n\n${attachment}`,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        }
      } else {
        if (options.message.embeds) {
          await webhook.send({
            content: `${message_tosend}`,
            embeds: options.message.embeds,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        } else {
          await webhook.send({
            content: `${message_tosend}`,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        }
      }
    } else {
      if (options.message.attachments.size > 0) {
        const attachment = `${message.attachments.first()?.url}`;
        if (options.message.embeds) {
          await webhook.send({
            content: `${attachment}`,
            embeds: options.message.embeds,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        } else {
          await webhook.send({
            content: `${attachment}`,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        }
      } else {
        if (options.message.embeds) {
          await webhook.send({
            embeds: options.message.embeds,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        } else {
          throw new TypeError(
            `[CLONE ERROR] Couldn't clone that message! (Channel: ${options.channel.id} - Message: ${options.message.id})`,
          );
        }
      }
    }
  } else {
    if (options.message.content && options.message.content !== "") {
      if (options.message.attachments.size > 0) {
        const attachment = `${options.message.attachments.first()?.url}`;
        if (options.message.embeds) {
          await options.channel.send({
            content: `${message_tosend} \n\n${attachment}`,
            embeds: options.message.embeds,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        } else {
          await options.channel.send({
            content: `${message_tosend} \n\n${attachment}`,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        }
      } else {
        if (options.message.embeds) {
          await options.channel.send({
            content: `${message_tosend}`,
            embeds: options.message.embeds,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        } else {
          await options.channel.send({
            content: `${message_tosend}`,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        }
      }
    } else {
      if (options.message.attachments.size > 0) {
        const attachment = `${options.message.attachments.first()?.url}`;
        if (options.message.embeds) {
          await options.channel.send({
            content: `${attachment}`,
            embeds: options.message.embeds,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        } else {
          await options.channel.send({
            content: `${attachment}`,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        }
      } else {
        if (options.message.embeds) {
          await options.channel.send({
            embeds: options.message.embeds,
            username: author,
            avatarURL: options.message.author.displayAvatarURL({
              dynamic: true,
            }),
          });
        } else {
          throw new TypeError(
            `[CLONE ERROR] Couldn't clone that message! (Channel: ${options.channel.id} - Message: ${options.message.id})`,
          );
        }
      }
    }
  }
}

export default { cloneMsg };
