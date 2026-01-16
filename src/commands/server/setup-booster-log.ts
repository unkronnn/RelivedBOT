import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from "discord.js"
import { Command } from "../../../shared/types/command"

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("setup-booster-log")
    .setDescription("Setup booster log channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel for booster logs")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("media_url")
        .setDescription("Optional media URL for booster log message")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel("channel", true) as TextChannel
    const media_url = interaction.options.getString("media_url", false) || ""

    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "Please provide a valid text channel for booster logs.",
        ephemeral: true,
      })
      return
    }

    const content_lines = [
      `## Booster Log Setup`,
      ``,
      `**Booster Log Channel:** <#${channel.id}>`,
    ]

    if (media_url) {
      content_lines.push(`**Media URL:** ${media_url}`)
    }

    content_lines.push(``)
    content_lines.push(`### Environment Variables Required`)
    content_lines.push(`Add these to your \`.env\` file:`)
    content_lines.push(`\`\`\``)
    content_lines.push(`BOOSTER_LOG_CHANNEL_ID=${channel.id}`)
    if (media_url) {
      content_lines.push(`BOOSTER_MEDIA_URL=${media_url}`)
    }
    content_lines.push(`\`\`\``)
    content_lines.push(``)
    content_lines.push(`**Note:** Restart the bot after updating the .env file.`)

    await interaction.reply({
      content: content_lines.join("\n"),
      ephemeral: true,
    })

    console.log(`[SETUP-BOOSTER] Channel set to ${channel.id}`)
  },
}
