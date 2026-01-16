import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js"
import { Command } from "../../../shared/types/command"
import * as component from "../../shared/utils/components.js"
import * as api from "../../shared/utils/discord_api.js"

const logo_url = "https://cdn.discordapp.com/icons/932775016309874708/a_6f3a9f7c5e3d2b1a8c9d4e5f6a7b8c9d.gif"

function build_rules_message() {
  return component.build_message({
    components: [
      component.container({
        components: [
          component.section({
            content: [
              `## Server Rules`,
              `Hello and welcome! We want everyone to have fun here, regardless of background or rank, so we've got a few rules you'll need to follow:`,
            ],
            thumbnail: logo_url,
          }),
          component.divider(),
          component.text([
            `### 1. Respect Everyone`,
            `Treat others with kindness and respect. No harassment, toxic behavior, or personal attacks.`,
            ``,
            `### 2. No Controversial Topics`,
            `Avoid discussions about politics, religion, or sensitive issues that could create conflicts. Keep the vibe positive!`,
            ``,
            `### 3. Zero Tolerance for Hate Speech`,
            `No racism, sexism, homophobia, or any form of discrimination. This includes offensive slurs, derogatory language, and targeted hate.`,
            ``,
            `### 4. No Spam or Unwanted Promotions`,
            `Avoid sending excessive messages, emojis, caps, pings, or posting Discord invites and self-promo without permission.`,
            ``,
            `### 5. Protect Privacy`,
            `Do not share your personal information or anyone else's (e.g., real name, address, phone number, DMs, or private messages).`,
            ``,
            `### 6. Report Issues, Don't Handle Them Yourself`,
            `If you see someone breaking the rules, report it to the moderators instead of engaging. False reports will result in punishment.`,
            ``,
            `### 7. Follow Discord Terms of Service`,
            `Any violation of Discord's ToS is strictly forbidden. If Discord doesn't allow it, neither do we.`,
          ]),
          component.divider(),
          component.text([
            `## Have Fun & Engage!`,
            `Be friendly, make new friends, and contribute positively to the community. Respect others and enjoy your stay!`,
          ]),
        ],
      }),
    ],
  })
}

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rules-setup")
    .setDescription("Send the server rules panel to a channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send rules to")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    const channel = interaction.options.getChannel("channel", true) as TextChannel

    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.editReply({ content: "Please provide a valid text channel." })
      return
    }

    const message = build_rules_message()
    const response = await api.send_components_v2(channel.id, api.get_token(), message)

    if (!response.error) {
      await interaction.editReply({
        content: `Rules panel sent to <#${channel.id}>!`,
      })
    } else {
      console.error("[RULES-SETUP] Error:", response)
      await interaction.editReply({ content: "Failed to send rules panel." })
    }
  },
}
