import { Client } from "discord.js"
import * as component from "../shared/utils/components"
import * as api from "../shared/utils/discord_api"

const devlog_thumb_url = "https://media.discordapp.net/attachments/932775016368586788/1461520241069658399/WhatsApp_Image_2026-01-14_at_22.33.43.jpeg?ex=696ada4b&is=696988cb&hm=17250544eb411aac3394c8754f211c1da627006a1b5fd56ad5e5508ec45923b9&=&format=webp"

interface devlog_options {
  client: Client
  version: string
  added: string
  improved: string
  removed: string
  fixed: string
  role_ids?: string[]
}

function format_list(items: string, prefix: string): string {
  if (!items.trim()) return ""
  return items
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => `${prefix} ${line.trim()}`)
    .join("\n")
}

export async function publish_devlog(options: devlog_options) {
  const { client, version, added, improved, removed, fixed, role_ids } = options

  try {
    const devlog_channel_id = process.env.DEVLOG_CHANNEL_ID
    if (!devlog_channel_id) {
      return {
        success: false,
        error: "Devlog channel not configured in .env",
      }
    }

    const added_list = format_list(added, "[ + ]")
    const improved_list = format_list(improved, "[ / ]")
    const removed_list = format_list(removed, "[ - ]")
    const fixed_list = format_list(fixed, "[ ! ]")

    const role_mentions =
      role_ids && role_ids.length > 0
        ? role_ids.map((id) => `<@&${id}>`).join(" ")
        : ""

    const changelog_sections: string[][] = []

    if (added_list) {
      changelog_sections.push([`### ➕ Added`, ``, added_list])
    }

    if (removed_list) {
      changelog_sections.push([`### ➖ Removed`, ``, removed_list])
    }

    if (fixed_list) {
      changelog_sections.push([`### 🐛 Fixed`, ``, fixed_list])
    }

    if (improved_list) {
      changelog_sections.push([`### 🔧 Improved`, ``, improved_list])
    }

    const header_section = [
      `## 📝 Developer Update Logs`,
      role_mentions,
      ``,
      `**Relived Roleplay Community**`,
      `**Version:** v${version}`,
      ``,
      `> Found any bugs or issues? Feel free to report them!`,
      `> Got ideas or suggestions?  We'd love to hear them!`,
    ]

    const containerComponents: any[] = []

    // Header section
    containerComponents.push(
      component.container({
        components: [
          component.section({
            content: header_section,
            media: devlog_thumb_url,
          }),
        ],
      })
    )

    // Changelog sections with dividers
    if (changelog_sections.length > 0) {
      const changelogComponents: any[] = []

      changelog_sections.forEach((section, index) => {
        changelogComponents.push(component.text(section))
        if (index < changelog_sections.length - 1) {
          changelogComponents.push(component.divider(2))
        }
      })

      containerComponents.push(
        component.container({
          components: changelogComponents,
        })
      )
    }

    // Button section
    containerComponents.push(
      component.container({
        components: [
          component.action_row(
            component.link_button("Report Bugs", "https://discord.com/channels/932775016309874708/1461411366605820079"),
            component.link_button("Suggest a Feature", "https://discord.com/channels/932775016309874708/1461376961204060353")
          ),
        ],
      })
    )

    const message = component.build_message({
      components: containerComponents,
    })

    const response = await api.send_components_v2(
      devlog_channel_id,
      api.get_token(),
      message
    )

    if (response.error) {
      console.error("[devlog] Error:", response.error)
      return {
        success: false,
        error: "Failed to publish devlog",
      }
    }

    return {
      success: true,
      message: `✅ Devlog published for version **v${version}**!`,
    }
  } catch (err) {
    console.error("[devlog] Exception:", err)
    return {
      success: false,
      error: "Failed to publish devlog",
    }
  }
}
