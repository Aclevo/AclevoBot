/*
 * AclevoBot v1
 * (c) 2026 Aclevo
 */

import { SlashCommandBuilder } from "discord.js";

const meta = () => {
  return new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify yourself!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Set up verification for the server")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to verify in")
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to give after verification")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("start")
        .setDescription("Start the verification process"),
    );
};

const execute = async (bot, interaction) => {
  if (interaction.options.getSubcommand() === "setup") {
    if (!interaction.memberPermissions.has("ManageGuild")) {
      await interaction.reply({
        content:
          "You don't have permission to configure verification on this server.",
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.options.getChannel("channel");
    const role = interaction.options.getRole("role");

    if (channel.type !== 0) {
      // 0 is GuildText
      await interaction.reply({
        embeds: [
          {
            title: `${bot.config.system.emotes.error} That doesn't look right...`,
            color: bot.config.colors.red,
            description: `Here's what just happened: The channel specified cannot be used for verification.`,
            fields: [
              {
                name: "Here's what to do",
                value:
                  " -> Please ensure that the channel you provided is a text channel - not a stage or voice channel.\n -> Please try your request again",
              },
            ],
          },
        ],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [
        {
          title: `${bot.config.system.emotes.wait} Configuring Verification...`,
          color: bot.config.colors.blue,
          description: `Setting up verification with the following information:\n - **Role to give**: ${role.name}\n - **Channel to verify in**: #${channel.name} (<#${channel.id}>)`,
        },
      ],
    });

    try {
      const verificationSettings = {
        channel: channel.id,
        role: role.id
      };

      const affectedRows = await bot.DBs.serverSettings.update(
        { verification: JSON.stringify(verificationSettings, null, "\t") },
        { where: { serverID: interaction.guild.id } }
      );

      if (affectedRows > 0) {
        await interaction.editReply({
          embeds: [
            {
              title: `${bot.config.system.emotes.success} Configured Verification!`,
              color: bot.config.colors.lime,
              description: `Great news! Verification is now setup!\nNow, go tell them newcomers to verify in ${channel.name} (<#${channel.id}>)!`
            },
          ],
        });
      } else {
        throw new Error("Failed to save to database");
      }
    } catch (error) {
      await interaction.editReply({
        embeds: [
          {
            title: `${bot.config.system.emotes.error} Whoopsie! Something went wrong!`,
            color: bot.config.colors.red,
            description: `Here's what just happened: ${error.message}`,
            fields: [
              {
                name: "Here's what to do",
                value: " -> Please try your request again",
              },
            ],
          },
        ],
      });
    }
  } else if (interaction.options.getSubcommand() === "start") {
    // Do the verification here
    const verificationData = await bot.DBs.verification.findOne({
      where: { serverID: interaction.guild.id, userID: interaction.user.id }
    });

    await interaction.reply({
      embeds: [
        {
          title: `${bot.config.system.emotes.wait} Preparing to verify you...`,
          color: bot.config.colors.blue,
          description: "Looking for you (in the database)...",
        },
      ],
    });

    async function errorDB(errorMsg) {
      const messages = {
        VERIFY_NOT_SETUP: [
          "Verification is not set up in this server",
          " -> Contact a Staff member",
        ],
        ROLE_NOT_EXIST: [
          "The verified role does not exist",
          " -> Contact a Staff member",
        ],
        CHANNEL_NOT_EXIST: [
          "The verification channel does not exist",
          " -> Contact a Staff member",
        ],
        ALREADY_VERIFY: [
          "You have already been verified",
          " -> Contact a Staff member",
        ],
        NOT_VERIFY_CHANNEL: [
          "This channel is not the verification channel",
          " -> Go to the correct channel\n -> If in correct channel, contact a Staff member",
        ],
        DEFAULT: [errorMsg, " -> Please try your request again"],
      };

      await interaction.editReply({
        embeds: [
          {
            author: {
              name: `Eep! Sorry about that, ${interaction.user.username}!`,
              icon_url: interaction.user.displayAvatarURL({
                extension: "png",
                dynamic: true,
                size: 1024,
              }),
            },
            title: `${bot.config.system.emotes.warning} Verification failed!`,
            color: bot.config.colors.orange,
            description: `Here's what just happened: ${messages[errorMsg] ? messages[errorMsg][0] : messages["DEFAULT"][0]}.`,
            fields: [
              {
                name: "Here's what to do",
                value: messages[errorMsg]
                  ? messages[errorMsg][1]
                  : messages["DEFAULT"][1],
              },
            ],
          },
        ],
      });
      bot.logger.error("DISCORD", `[MESSAGE] Verification for ${interaction.user.id} failed! Error: ${errorMsg}`);
    }

    try {
      if (verificationData) {
        try {
          await bot.functions.DB.deleteVerification(interaction.guild.id, interaction.user.id);
        } catch (error) {}
      }

      const serverSettings = await bot.DBs.serverSettings.findOne({
        where: { serverID: interaction.guild.id }
      });

      const verificationSettingsStr = serverSettings.get("verification");
      if (!verificationSettingsStr) throw new Error("VERIFY_NOT_SETUP");

      const verificationSettings = JSON.parse(verificationSettingsStr);

      if (!verificationSettings.channel || interaction.channel.id !== verificationSettings.channel) {
        throw new Error("NOT_VERIFY_CHANNEL");
      }

      if (!verificationSettings.role || !interaction.guild.roles.cache.get(verificationSettings.role)) {
        throw new Error("ROLE_NOT_EXIST");
      }

      const member = await interaction.guild.members.fetch(interaction.user.id);
      if (member.roles.cache.has(verificationSettings.role)) {
        throw new Error("ALREADY_VERIFY");
      }

      // Generate verification code
      const codeGen = bot.functions.generateRandomCode(8);

      await bot.functions.DB.createVerification(interaction.guild.id, interaction.user.id, interaction.id, codeGen);

      await interaction.editReply({
        embeds: [
          {
            title: `${bot.config.system.emotes.information} Welcome to the server!`,
            color: bot.config.colors.blue,
            fields: [
              { name: `Welcome to ${interaction.guild.name}!`, value: "Ah, a newcomer! How fun!\nPlease ensure to read the server rules." },
              { name: "Okay, enough talk.", value: `Your code is: \`${codeGen}\`.\nYour next message should be the code.` },
            ]
          },
        ],
      });

      // Wait for verification code
      const filter = m => m.author.id === interaction.user.id;
      const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });

      collector.on("collect", async m => {
        if (m.content === codeGen) {
          try {
            m.delete().catch(err => {});
            try {
              await bot.functions.DB.deleteVerification(interaction.guild.id, interaction.user.id);
            } catch (error) {}

            const updatedServerSettings = await bot.DBs.serverSettings.findOne({
              where: { serverID: interaction.guild.id }
            });

            const updatedVerificationSettingsStr = updatedServerSettings.get("verification");
            if (!updatedVerificationSettingsStr) throw new Error("VERIFY_NOT_SETUP");

            const updatedVerificationSettings = JSON.parse(updatedVerificationSettingsStr);

            if (!updatedVerificationSettings.channel || interaction.channel.id !== updatedVerificationSettings.channel) {
              throw new Error("NOT_VERIFY_CHANNEL");
            }

            if (!updatedVerificationSettings.role || !interaction.guild.roles.cache.get(updatedVerificationSettings.role)) {
              throw new Error("ROLE_NOT_EXIST");
            }

            const updatedMember = await interaction.guild.members.fetch(interaction.user.id);
            if (updatedMember.roles.cache.has(updatedVerificationSettings.role)) {
              throw new Error("ALREADY_VERIFY");
            }

            await updatedMember.roles.add(updatedVerificationSettings.role);

            await interaction.editReply({
              embeds: [
                {
                  author: {
                    name: `Whoop whoop, ${interaction.user.username}!`,
                    icon_url: interaction.user.displayAvatarURL({ extension: "png", dynamic: true, size: 1024 })
                  },
                  title: `${bot.config.system.emotes.success} Verified!`,
                  color: bot.config.colors.lime,
                  description: `Here's what just happened: You successfully verified!\nHave fun and enjoy your stay!`
                },
              ],
            });
            bot.logger.info("DISCORD", `[MESSAGE] ${interaction.user.id} successfully verified.`);

          } catch (error) {
            errorDB(error.message);
          }
        } else {
          try {
            await m.react(bot.config.system.emotes.error);
          } catch (error) {
            // Ignore reaction errors
          }
        }
      });

      collector.on("end", async collected => {
        const codeEnteredCorrectly = collected.some(m => m.content === codeGen);
        if (!codeEnteredCorrectly) {
          errorDB(`You did not enter the code ${collected.size < 1 ? "in time" : "correctly"}`);
        }
      });
    } catch (error) {
      errorDB(error.message);
    }
  }
};

export default (app) => ({
  meta,
  execute,
});
