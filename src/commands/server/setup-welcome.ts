import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from "discord.js"
import { Command } from "../../../shared/types/command"
import * as component from "../../shared/utils/components.js"

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("setup-welcome")
    .setDescription("Setup welcome message configuration")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send welcome messages")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("rules_channel")
        .setDescription("The rules channel to mention (optional)")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    const welcome_channel = interaction.options.getChannel("channel", true) as TextChannel
    const rules_channel = interaction.options.getChannel("rules_channel", false) as TextChannel | null

    if (!welcome_channel || welcome_channel.type !== ChannelType.GuildText) {
      await interaction.editReply({
        content: "Please provide a valid text channel for welcome messages.",
      })
      return
    }

    const content_lines = [
      `## Welcome System Setup`,
      ``,
      `**Welcome Channel:** <#${welcome_channel.id}>`,
    ]

    if (rules_channel) {
      content_lines.push(`**Rules Channel:** <#${rules_channel.id}>`)
    }

    content_lines.push(``)
    content_lines.push(`### Environment Variables Required`)
    content_lines.push(`Add these to your \`.env\` file:`)
    content_lines.push(`\`\`\``)
    content_lines.push(`WELCOME_CHANNEL_ID=${welcome_channel.id}`)
    if (rules_channel) {
      content_lines.push(`RULES_CHANNEL_ID=${rules_channel.id}`)
    }
    content_lines.push(`\`\`\``)
    content_lines.push(``)
    content_lines.push(`**Note:** Restart the bot after updating the .env file.`)

    const message = component.build_message({
      components: [
        component.container({
          components: [component.text(content_lines)],
        }),
      ],
    })

    await interaction.editReply(message)

    // Send test welcome message
    try {
      const test_avatar = interaction.user.displayAvatarURL({ extension: "png", size: 256 })
      const server_icon =
        interaction.guild?.iconURL({ extension: "png", size: 256 }) ||
        "https://cdn.discordapp.com/embed/avatars/0.png"

      const test_content_parts = [
        `## Welcome`,
        `<@${interaction.user.id}>, you've just joined **${interaction.guild?.name}**.`,
        `We're glad to have you here.`,
      ]

      const test_components = [
        component.section({
          content: test_content_parts,
          thumbnail: test_avatar,
        }),
      ]

      if (rules_channel) {
        test_components.push(component.divider())
        test_components.push(
          component.section({
            content: [
              `## Start Here`,
              `Before exploring, please read <#${rules_channel.id}> to understand how everything works.`,
            ],
            thumbnail: server_icon,
          })
        )
      }

      const test_message = component.build_message({
        components: [
          component.container({
            components: test_components,
          }),
        ],
      })

      await welcome_channel.send(test_message)

      console.log(`[SETUP-WELCOME] Test message sent to ${welcome_channel.id}`)
    } catch (error) {
      console.error("[SETUP-WELCOME] Failed to send test message:", error)
    }
  },
}
