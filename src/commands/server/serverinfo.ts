import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
  EmbedBuilder,
  Message,
}                      from "discord.js"
import { Command }     from "../../../shared/types/command"

// Store active serverinfo messages for auto-update
const active_serverinfo = new Map<string, { message: Message; interval: NodeJS.Timeout }>()

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Show server information with auto-update"),

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild

    if (!guild) {
      await interaction.reply({
        content   : "This command can only be used in a server.",
        flags     : 64,
      })
      return
    }

    // Defer reply immediately to prevent timeout
    await interaction.deferReply()

    // Function to build server info embed
    const buildServerInfo = async () => {
      await guild.members.fetch() // Fetch all members for accurate count
      
      const total_members = guild.memberCount
      const bot_count = guild.members.cache.filter(m => m.user.bot).size
      const human_members = total_members - bot_count
      const boost_count = guild.premiumSubscriptionCount || 0
      const icon_url = guild.iconURL({ size: 256 }) || undefined

      const embed = new EmbedBuilder()
        .setTitle(`📊 ${guild.name} Statistics`)
        .setDescription([
          `**All Members:** ${total_members}`,
          `**Members:** ${human_members}`,
          `**Bots:** ${bot_count}`,
          `**Boosts:** ${boost_count}`,
          ``,
          `*Auto-updates every 1 minute*`,
        ].join('\n'))
        .setTimestamp()

      if (icon_url) {
        embed.setThumbnail(icon_url)
      }

      return { embeds: [embed] }
    }

    // Clear existing interval for this channel if any
    const existing = active_serverinfo.get(interaction.channelId)
    if (existing) {
      clearInterval(existing.interval)
    }

    // Send initial message
    const initialMessage = await buildServerInfo()
    const sentMessage = await interaction.editReply(initialMessage) as Message

    // Set up auto-update interval (every 1 minute)
    const updateInterval = setInterval(async () => {
      try {
        const updatedMessage = await buildServerInfo()
        await sentMessage.edit(updatedMessage)
      } catch (error) {
        console.error("[SERVERINFO] Failed to update:", error)
        // Clear interval if message was deleted or error occurred
        clearInterval(updateInterval)
        active_serverinfo.delete(interaction.channelId)
      }
    }, 60000) // 60000ms = 1 minute

    // Store interval reference
    active_serverinfo.set(interaction.channelId, {
      message: sentMessage,
      interval: updateInterval,
    })

    // Clean up after 1 hour to prevent memory leaks
    setTimeout(() => {
      clearInterval(updateInterval)
      active_serverinfo.delete(interaction.channelId)
    }, 3600000) // 1 hour
  },
}
