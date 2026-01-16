import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ThreadChannel,
} from "discord.js"
import { Command } from "../../../shared/types/command"

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("close-request")
    .setDescription("Request to close this ticket")
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Alasan penutupan ticket")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("deadline")
        .setDescription("Deadline untuk response (e.g., 24 jam, 3 hari)")
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.channel

    // Check if in thread
    if (!channel?.isThread()) {
      await interaction.reply({
        content: "Command ini hanya bisa digunakan di dalam ticket thread!",
        ephemeral: true,
      })
      return
    }

    const thread = channel as ThreadChannel
    const reason = interaction.options.getString("reason", true)
    const deadline = interaction.options.getString("deadline", true)

    // Get ticket owner from thread name or metadata
    const threadName = thread.name
    const ticketOwnerMatch = threadName.match(/- (.+)$/)
    
    if (!ticketOwnerMatch) {
      await interaction.reply({
        content: "Tidak dapat menemukan pemilik ticket!",
        ephemeral: true,
      })
      return
    }

    await interaction.deferReply()

    const confirmMessage = {
      embeds: [{
        title: "🔒 Permintaan Penutupan Ticket",
        color: 0xFEE75C,
        fields: [
          {
            name: "Diminta oleh",
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
          {
            name: "Deadline Response",
            value: deadline,
            inline: true,
          },
          {
            name: "Alasan Penutupan",
            value: reason,
            inline: false,
          },
        ],
        footer: {
          text: "Silakan terima atau tolak permintaan ini",
        },
        timestamp: new Date().toISOString(),
      }],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 3,
              label: "Accept",
              custom_id: `close_accept:${interaction.user.id}`,
              emoji: "✅",
            },
            {
              type: 2,
              style: 4,
              label: "Deny",
              custom_id: `close_deny:${interaction.user.id}`,
              emoji: "❌",
            },
          ],
        },
      ],
    }

    await interaction.editReply(confirmMessage)
  },
}
