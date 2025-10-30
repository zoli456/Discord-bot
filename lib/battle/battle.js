// BattleGame.js
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

// --- Constants for game balance ---
const BASE_DMG = 15;
const CRIT_CHANCE = 0.25;
const CRIT_MULTIPLIER = 2;
const HEAL_AMOUNT = 20;
const SPECIAL_COST = 50;
const SPECIAL_DMG = 35;
const ROUND_RESULT_DELAY = 5000; // 5 seconds to show results before next round
const INACTIVITY_TIMEOUT = 45000; // 45 seconds for a player to make a move

class BattleGame {
  constructor(interaction, opponent) {
    this.interaction = interaction;
    this.channel = interaction.channel;
    this.player1 = interaction.user;
    this.player2 = opponent;
    this.players = [
      this.player1, this.player2,
    ];

    this.stats = {
      [this.player1.id]: { health: 100, energy: 0 },
      [this.player2.id]: { health: 100, energy: 0 },
    };

    this.choices = {
      [this.player1.id]: null,
      [this.player2.id]: null,
    };

    this.playerDms = {
      [this.player1.id]: null,
      [this.player2.id]: null,
    };

    this.gameMessage = null;
    this.round = 0;
    this.winner = null;
    this.roundTimeout = null;
    this.boundInteractionHandler = null;
  }

  async startGame() {
    // Create the initial game message that we will edit from now on
    const initialEmbed = this.createMainEmbed(
      `The battle between ${this.player1.username} and ${this.player2.username} begins!`,
      "Waiting for players to make their first move...",
    );
    this.gameMessage = await this.interaction.followUp({
      embeds: [
        initialEmbed,
      ],
      // fetchReply: true,
    });
    this.startRound();
  }

  async startRound() {
    this.round++;
    this.choices[this.player1.id] = null;
    this.choices[this.player2.id] = null;

    // The main message to announce the new round ---
    const roundAnnounceEmbed = this.createMainEmbed(
      `⚔️ Round ${this.round} is starting!`,
      "Players have been sent their actions via DM.",
    );
    await this.gameMessage.edit({
      embeds: [
        roundAnnounceEmbed,
      ],
    });

    // --- Send Individual UIs via DM ---
    for (const player of this.players) {
      const embed = this.createGameEmbedForPlayer(player);
      const components = this.createActionRows(player.id);
      try {
        const dmChannel = await player.createDM();
        const dmMessage = await dmChannel.send({
          content: `**Round ${this.round}**! It's your turn to act.`,
          embeds: [
            embed,
          ],
          components: [
            components,
          ],
        });
        this.playerDms[player.id] = dmMessage;
      } catch (error) {
        console.error(`Could not send DM to ${player.username}.`);
        this.endGame(`${player.username} could not receive DMs, ending the game.`);
        return;
      }
    }

    this.setupCollector();
  }

  setupCollector() {
    if (this.boundInteractionHandler) {
      this.channel.client.removeListener("interactionCreate", this.boundInteractionHandler);
    }
    this.boundInteractionHandler = this.handleInteraction.bind(this);
    this.channel.client.on("interactionCreate", this.boundInteractionHandler);

    this.roundTimeout = setTimeout(() => this.handleTimeout(), INACTIVITY_TIMEOUT);
  }

  async handleInteraction(interaction) {
    if (
      !interaction.isButton() ||
      !this.players.some((p) => p.id === interaction.user.id) ||
      this.choices[interaction.user.id]
    )
      return;

    const playerId = interaction.user.id;

    if (interaction.customId === "special" && this.stats[playerId].energy < SPECIAL_COST) {
      return interaction.reply({
        content: `You don't have enough energy! You need ${SPECIAL_COST}.`,
      });
    }

    this.choices[playerId] = interaction.customId;
    await interaction.update({
      content: `You chose **${interaction.customId}**! Waiting for your opponent.`,
      components: [],
      embeds: [],
    });

    if (this.choices[this.player1.id] && this.choices[this.player2.id]) {
      clearTimeout(this.roundTimeout);
      this.processRound();
    }
  }

  async processRound() {
    const p1 = { id: this.player1.id, choice: this.choices[this.player1.id] };
    const p2 = { id: this.player2.id, choice: this.choices[this.player2.id] };
    const results = {
      [p1.id]: { damage: 0, heal: 0, energy: 0, summary: [] },
      [p2.id]: { damage: 0, heal: 0, energy: 0, summary: [] },
    };

    this.evaluateAction(p1, p2, results);
    this.evaluateAction(p2, p1, results);

    this.stats[p1.id].health = Math.max(
      0,
      Math.min(100, this.stats[p1.id].health - results[p1.id].damage + results[p1.id].heal),
    );
    this.stats[p1.id].energy = Math.min(100, this.stats[p1.id].energy + results[p1.id].energy);
    this.stats[p2.id].health = Math.max(
      0,
      Math.min(100, this.stats[p2.id].health - results[p2.id].damage + results[p2.id].heal),
    );
    this.stats[p2.id].energy = Math.min(100, this.stats[p2.id].energy + results[p2.id].energy);

    const roundSummary =
      [
        ...results[p1.id].summary, ...results[p2.id].summary,
      ].join("\n") || "An eerie silence marks the end of the round.";

    // --- Show round results in DMs ---
    for (const player of this.players) {
      const playerChoice = this.choices[player.id];
      const opponent = player.id === this.player1.id ? this.player2 : this.player1;
      const opponentChoice = this.choices[opponent.id];
      const dmSummary = `You chose **${playerChoice}**. Your opponent chose **${opponentChoice}**.\n\n${roundSummary}`;

      if (this.playerDms[player.id]) {
        try {
          await this.playerDms[player.id].edit({
            content: `**Round ${this.round} Results**\n${dmSummary}`,
            embeds: [],
            components: [],
          });
        } catch (error) {
          console.error(`Could not edit DM for ${player.username}. It might have been deleted.`);
        }
      }
    }

    const summaryEmbed = this.createMainEmbed(`Round ${this.round} Results`, roundSummary);
    await this.gameMessage.edit({
      embeds: [
        summaryEmbed,
      ],
    });

    // Check for a winner
    if (this.stats[p1.id].health <= 0 || this.stats[p2.id].health <= 0) {
      if (this.stats[p1.id].health <= 0 && this.stats[p2.id].health <= 0) this.winner = "draw";
      else if (this.stats[p1.id].health <= 0) this.winner = this.player2;
      else this.winner = this.player1;
      setTimeout(() => this.endGame(), ROUND_RESULT_DELAY); // Delay before showing final result
    } else {
      // Wait before starting the next round
      setTimeout(() => this.startRound(), ROUND_RESULT_DELAY);
    }
  }

  evaluateAction(actor, target, results) {
    const actorUser = this.players.find((p) => p.id === actor.id);
    const targetUser = this.players.find((p) => p.id === target.id);

    if (results[actor.id].summary.length > 0) return;

    switch (actor.choice) {
      case "attack":
        const isCrit = Math.random() < CRIT_CHANCE;
        const damage = isCrit ? BASE_DMG * CRIT_MULTIPLIER : BASE_DMG;
        if (target.choice === "defend") {
          results[actor.id].summary.push(
            `🛡️ ${actorUser.username} attacked, but ${targetUser.username} defended!`,
          );
        } else {
          results[target.id].damage = damage;
          results[actor.id].energy += 20;
          results[actor.id].summary.push(
            `⚔️ ${actorUser.username} hit ${targetUser.username} for **${damage}** damage${isCrit ? " (CRIT!)" : ""}!`,
          );
        }
        break;
      case "special":
        results[actor.id].energy -= SPECIAL_COST;
        let specialDamage = target.choice === "defend" ? SPECIAL_DMG / 2 : SPECIAL_DMG;
        results[target.id].damage = specialDamage;
        results[actor.id].summary.push(
          `💥 ${actorUser.username} used a special on ${targetUser.username} for **${specialDamage}** damage!`,
        );
        break;
      case "heal":
        if (target.choice !== "attack" && target.choice !== "special") {
          results[actor.id].heal = HEAL_AMOUNT;
          results[actor.id].summary.push(
            `💚 ${actorUser.username} healed for **${HEAL_AMOUNT}** HP.`,
          );
        }
        break;
      case "defend":
        results[actor.id].energy += 15;
        if (target.choice === "defend") results[actor.id].summary.push(`🛡️ Both players defended.`);
        else if (target.choice === "heal")
          results[actor.id].summary.push(
            `🛡️ ${actorUser.username} defended while their opponent healed.`,
          );
        break;
    }
  }

  handleTimeout() {
    clearTimeout(this.roundTimeout);
    let summary;
    const p1TimedOut = !this.choices[this.player1.id];
    const p2TimedOut = !this.choices[this.player2.id];

    if (p1TimedOut && p2TimedOut) {
      summary = "Game aborted! Both players failed to act in time. It's a draw.";
      this.winner = "draw";
    } else if (p1TimedOut) {
      this.winner = this.player2;
      summary = `Game aborted! ${this.player1.username} failed to act in time.`;
    } else {
      this.winner = this.player1;
      summary = `Game aborted! ${this.player2.username} failed to act in time.`;
    }
    this.endGame(summary);
  }

  async endGame(summaryText) {
    if (this.boundInteractionHandler) {
      this.channel.client.removeListener("interactionCreate", this.boundInteractionHandler);
    }
    if (this.roundTimeout) clearTimeout(this.roundTimeout);

    const finalEmbed = this.createMainEmbed(
      "🎉 Battle Over!",
      summaryText || "The dust settles...",
    );

    if (this.winner === "draw") {
      finalEmbed.addFields({ name: "Result", value: "The battle is a draw!" });
    } else if (this.winner) {
      finalEmbed.addFields({ name: "Winner", value: `**${this.winner.username}** is victorious!` });
    }

    // Perform the final edit on the main game message in the channel
    await this.gameMessage.edit({
      embeds: [
        finalEmbed,
      ],
      components: [],
    });

    // --- Send final result in DMs ---
    for (const player of this.players) {
      let personalSummary = summaryText;
      let resultColor = "Greyple"; // Default color

      if (this.winner === "draw") {
        personalSummary += "\nIt was a draw!";
        resultColor = "Yellow";
      } else if (this.winner && this.winner.id === player.id) {
        personalSummary += "\n\n**Congratulations, you are victorious!** 🏆";
        resultColor = "Gold";
      } else if (this.winner) {
        personalSummary += `\n\n**You were defeated by ${this.winner.username}.**`;
        resultColor = "Red";
      }

      const finalDmEmbed = new EmbedBuilder()
        .setTitle("🎉 Battle Over! 🎉")
        .setDescription(personalSummary)
        .setColor(resultColor)
        .addFields(
          {
            name: `${this.player1.username}'s Final Stats`,
            value: `❤️ ${this.stats[this.player1.id].health} HP\n⚡ ${this.stats[this.player1.id].energy} Energy`,
            inline: true,
          },
          {
            name: `${this.player2.username}'s Final Stats`,
            value: `❤️ ${this.stats[this.player2.id].health} HP\n⚡ ${this.stats[this.player2.id].energy} Energy`,
            inline: true,
          },
        )
        .setTimestamp();

      try {
        await player.send({
          embeds: [
            finalDmEmbed,
          ],
        });
      } catch (error) {
        console.error(`Could not send final result DM to ${player.username}.`);
      }
    }
  }

  // --- Helper function to create the main embed consistently ---
  createMainEmbed(title, description) {
    return new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor("DarkVividPink")
      .addFields(
        {
          name: `${this.player1.username}'s Stats`,
          value: `❤️ ${this.stats[this.player1.id].health} HP\n⚡ ${this.stats[this.player1.id].energy} Energy`,
          inline: true,
        },
        {
          name: `${this.player2.username}'s Stats`,
          value: `❤️ ${this.stats[this.player2.id].health} HP\n⚡ ${this.stats[this.player2.id].energy} Energy`,
          inline: true,
        },
      )
      .setTimestamp();
  }

  createGameEmbedForPlayer(player) {
    const opponent = player.id === this.player1.id ? this.player2 : this.player1;
    return new EmbedBuilder()
      .setColor("Blurple")
      .setTitle("Your Battle Status")
      .addFields(
        {
          name: "Your Stats",
          value: `❤️ **${this.stats[player.id].health}** HP\n⚡ **${this.stats[player.id].energy}** Energy`,
          inline: true,
        },
        {
          name: `${opponent.username}'s Health`,
          value: `❤️ **${this.stats[opponent.id].health}** HP`,
          inline: true,
        },
      );
  }

  createActionRows(playerId) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("attack")
        .setLabel("Attack")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("⚔️"),
      new ButtonBuilder()
        .setCustomId("defend")
        .setLabel("Defend")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🛡️"),
      new ButtonBuilder()
        .setCustomId("heal")
        .setLabel("Heal")
        .setStyle(ButtonStyle.Success)
        .setEmoji("💚"),
      new ButtonBuilder()
        .setCustomId("special")
        .setLabel(`Special (${SPECIAL_COST})`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("💥")
        .setDisabled(this.stats[playerId].energy < SPECIAL_COST),
    );
  }
}

export async function createBattle(interaction, opponent) {
  if (opponent.bot || opponent.id === interaction.user.id) {
    return interaction.reply({ content: "You can't battle a bot or yourself!", ephemeral: true });
  }
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("accept_battle")
      .setLabel("Accept")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("decline_battle")
      .setLabel("Decline")
      .setStyle(ButtonStyle.Danger),
  );
  const challengeMessage = await interaction.reply({
    content: `${opponent}, you've been challenged by ${interaction.user}! Do you accept?`,
    components: [
      row,
    ],
    //fetchReply: true,
  });
  const filter = (i) => i.user.id === opponent.id;
  const collector = challengeMessage.createMessageComponentCollector({
    filter,
    time: 30000,
    max: 1,
  });
  collector.on("collect", async (buttonInteraction) => {
    if (buttonInteraction.customId === "accept_battle") {
      await buttonInteraction.update({
        content: "Challenge accepted! The battle will now begin.",
        components: [],
      });
      const game = new BattleGame(interaction, opponent);
      await game.startGame();
    } else {
      await buttonInteraction.update({ content: "Challenge declined.", components: [] });
    }
  });
  collector.on("end", (collected) => {
    if (collected.size === 0) {
      interaction.editReply({ content: "The challenge expired.", components: [] });
    }
  });
}
