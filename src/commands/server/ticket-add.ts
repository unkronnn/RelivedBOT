import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ThreadChannel,
  User,
} from "discord.js"
import { Command } from "../../../shared/types/command"

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ticket-add")
    .setDescription("Add a user to the current ticket thread")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to add to this ticket")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    // Check if command is used in a thread
    if (!interaction.channel?.isThread()) {
      await interaction.reply({
        content: "❌ This command can only be used inside a ticket thread.",
        flags: 64,
      })
      return
    }

    const thread = interaction.channel as ThreadChannel
    const targetUser = interaction.options.getUser("user", true) as User

    try {
      // Add user to thread
      await thread.members.add(targetUser.id)

      await interaction.reply({
        content: `✅ User <@${targetUser.id}> has been added to this ticket.`,
      })

      console.log(`[TICKET-ADD] ${interaction.user.tag} added ${targetUser.tag} to thread ${thread.id}`)

    } catch (error) {
      console.error("[TICKET-ADD] Error adding user to thread:", error)
      await interaction.reply({
        content: "❌ Failed to add user to ticket. They may already be in the thread.",
        flags: 64,
      })
    }
  },
}
