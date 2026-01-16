import { GuildMember } from "discord.js"
import * as component from "../../shared/utils/components.js"
import * as api from "../../shared/utils/discord_api.js"

const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID || ""
const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID || ""

export async function handle_member_join(member: GuildMember): Promise<void> {
  try {
    if (!WELCOME_CHANNEL_ID) {
      console.log("[WELCOMER] Welcome channel ID not configured")
      return
    }

    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID)
    if (!channel || !channel.isTextBased()) {
      console.log("[WELCOMER] Welcome channel not found or not text-based")
      return
    }

    const user_avatar = member.user.displayAvatarURL({ extension: "png", size: 256 })
    const server_icon =
      member.guild.iconURL({ extension: "png", size: 256 }) ||
      "https://cdn.discordapp.com/embed/avatars/0.png"

    const content_parts = [
      `## Welcome`,
      `<@${member.user.id}>, you've just joined **${member.guild.name}**.`,
      `We're glad to have you here.`,
    ]

    const message_components = [
      component.section({
        content: content_parts,
        thumbnail: user_avatar,
      }),
    ]

    // Add rules section if configured
    if (RULES_CHANNEL_ID) {
      message_components.push(component.divider())
      message_components.push(
        component.section({
          content: [
            `## Start Here`,
            `Before exploring, please read <#${RULES_CHANNEL_ID}> to understand how everything works.`,
          ],
          thumbnail: server_icon,
        })
      )
    }

    const message = component.build_message({
      components: [
        component.container({
          components: message_components,
        }),
      ],
    })

    await api.send_components_v2(WELCOME_CHANNEL_ID, api.get_token(), message)

    console.log(`[WELCOMER] Welcome message sent for ${member.user.tag}`)
  } catch (error) {
    console.error("[WELCOMER] Error sending welcome message:", error)
  }
}
