import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js"
import { Command } from "../../../shared/types/command"
import * as component from "../../shared/utils/components"
import * as api from "../../shared/utils/discord_api"

const ticket_thumb_url = "https://media.discordapp.net/attachments/932775016368586788/1461520241069658399/WhatsApp_Image_2026-01-14_at_22.33.43.jpeg?ex=696ada4b&is=696988cb&hm=17250544eb411aac3394c8754f211c1da627006a1b5fd56ad5e5508ec45923b9&=&format=webp"

// Ticket type configurations with Discord Components v2 style
const TICKET_CONFIGS = {
  donate: {
    title: "💸 Donation Center",
    sections: [
      [
        ``,
        `### 🏠 Property Donation`,
        ``,
        `### 🏢 Commercial Property`,
        `• SuperMarket 24/7 — \`Rp 25.000\``,
        `• Electronic Store — \`Rp 30.000\``,
        `• Ammunition — \`Rp 50.000\``,
        `• Dealership — \`Rp 50.000\``,
        `• Sport Store — \`Rp 25.000\``,
        `• Clothes Store — \`Rp 25.000\``,
        `• Restaurant — \`Rp 25.000\``,
        ``,
        `### 🏡 Residential Property`,
        `• House Low — \`Rp 20.000\``,
        `• House Medium — \`Rp 30.000\``,
        `• House High — \`Rp 50.000\``,
        `• House Garage — \`Rp 20.000\``,
        ``,
        `### 🛠️ Special Items`,
        `• Private Garage — \`Rp 50.000\``,
        `• Private Farm (Beta) — \`Rp 50.000\``,
        `• Mapping (1-50 Objects) — \`Rp 25.000\``,
        ``,
      ],
      [
        `## 📦 Bundle Packages`,
        ``,
        `### 🥉 Package Basic`,
        `**Price:** \`Rp 35.000\` (With Mapping) / \`Rp 25.000\` (No Mapping)`,
        ``,
        `**Includes:**`,
        `• Money $10,000 • Change Name`,
        `• House Low • Mapping 1-50 Object (Optional)`,
        `• **Basic Donatur (30 Days)**`,
        `• 250 Gold • Vehicle Low (Dealer Biasa)`,
        ``,
        `### 🥈 Package Advanced`,
        `**Price:** \`Rp 40.000\` (With Mapping) / \`Rp 50.000\` (No Mapping)`,
        ``,
        `**Includes:**`,
        `• Money $20,000 • Change Name`,
        `• House Medium (Gate & Garage)`,
        `• Commercial Property (Pilih 1)`,
        `• Mapping 1-50 Object (Optional)`,
        `• **Advanced Donatur (30 Days)**`,
        `• 500 Gold • Vehicle Medium`,
        ``,
        `### 🥇 Package Professional / Lifetime`,
        `**Price:** \`Rp 90.000\` (Pro) / \`Rp 100.000\` (Lifetime)`,
        ``,
        `**Includes:**`,
        `• Money $50,000 • Change Name`,
        `• House High (Gate & Garage)`,
        `• Commercial & Residential Property`,
        `• Mapping 1-100 Object`,
        `• **Professional / Lifetime Status**`,
        `• 2500 Gold • Vehicle High`,
        ``,
      ],
      [
        `## 🌟 Donatur Perks`,
        ``,
        `### 🥉 Basic • 🥈 Advanced`,
        `\`✓\` Akses Dealer VIP • Save Radio`,
        `\`✓\` 5-10 Accessories & Mod Parts`,
        `\`✓\` Custom Font & Sticker`,
        `\`✓\` Slot Kendaraan +1`,
        `\`✓\` Slot Property & Garasi +3-4`,
        ``,
        `### 🥇 Professional • 💎 Lifetime`,
        `\`✓\` *Semua Fitur Advanced*`,
        `\`✓\` Join 2 Job Legal`,
        `\`✓\` Akses Helicopter & Pesawat`,
        `\`✓\` Slot Kendaraan +2-3`,
        `\`✓\` Slot Property +4-5`,
        ``,
        `-# Click button below to open donation ticket`,
      ],
    ],
    banner: "https://i.imgur.com/8ZqXxQF.png",
    button: component.secondary_button("💸 Donate Here", "ticket_donate"),
  },
  report_player: {
    title: "🚨 Report Player",
    content: [
      `## 🚨 Report Player`,
      ``,
      `**Reporting Rules & Guidelines**`,
      ``,
      `**Before reporting, please ensure:**`,
      `>  You have valid evidence (screenshots/videos)`,
      `>  The incident occurred within the last 7 days`,
      `>  You provide accurate player information`,
      ``,
      `**What to report:**`,
      `✓ Rule violations (RDM, VDM, etc.)`,
      `✓ Hacking/Cheating`,
      `✓ Scamming/Fraud`,
      `✓ Harassment/Toxicity`,
      ``,
      `**Warning:** False reports will result in penalties.`,
      ``,
      `-# All reports are reviewed by staff within 24 hours`,
    ],
    banner: "https://i.imgur.com/rK9pxLJ.png",
    button: component.secondary_button("🚨 Report Player", "ticket_report_player"),
  },
  report_bug: {
    title: "🐛 Bug Report Center",
    content: [
      `## 🐛 Bug Report Center`,
      ``,
      `**Help Us Improve the Server**`,
      ``,
      `**Information needed:**`,
      `>  Detailed description of the bug`,
      `>  Steps to reproduce`,
      `>  Screenshots or video proof`,
      `>  When did it occur`,
      ``,
      `**Bug Categories:**`,
      `✓ Gameplay bugs`,
      `✓ Visual/UI issues`,
      `✓ Script errors`,
      `✓ Performance issues`,
      ``,
      `Thank you for helping us maintain server quality!`,
      ``,
      `-# Your report helps improve everyone's experience`,
    ],
    banner: "https://i.imgur.com/L3kVxJ8.png",
    button: component.secondary_button("🐛 Report Bug", "ticket_report_bug"),
  },
  report_staff: {
    title: "👮 Report Staff Member",
    content: [
      `## 👮 Report Staff Member`,
      ``,
      `**Staff Accountability System**`,
      ``,
      `**When to report staff:**`,
      `>  Abuse of power/permissions`,
      `>  Unfair treatment/bias`,
      `>  Unprofessional behavior`,
      `>  Violation of staff guidelines`,
      ``,
      `**Required information:**`,
      `✓ Staff member's name`,
      `✓ Detailed description of incident`,
      `✓ Evidence (screenshots/videos)`,
      `✓ Date and time of incident`,
      ``,
      `**Confidentiality:** All reports are handled privately by management.`,
      ``,
      `-# Management reviews all staff reports confidentially`,
    ],
    banner: "https://i.imgur.com/xJ3kLm9.png",
    button: component.secondary_button("👮 Report Staff", "ticket_report_staff"),
  },
  cs: {
    title: "📖 Character Story (CS) Request",
    content: [
      `## 📖 Character Story (CS) Request`,
      ``,
      `**Character Development System**`,
      ``,
      `**CS Request allows you to:**`,
      `>  Change your character's name`,
      `>  Modify character background story`,
      `>  Update character appearance/identity`,
      ``,
      `**Requirements:**`,
      `✓ Valid roleplay reason`,
      `✓ Admin approval required`,
      `✓ May incur in-game costs`,
      `✓ Permanent change (irreversible)`,
      ``,
      `**Processing time:** 1-3 days after approval`,
      ``,
      `-# All CS requests require admin review and approval`,
    ],
    banner: "https://i.imgur.com/vM4pZx2.png",
    button: component.secondary_button("📖 Character Story", "ticket_cs"),
  },
  ck: {
    title: "💀 Character Killed (CK) Request",
    content: [
      `## 💀 Character Killed (CK) Request`,
      ``,
      `**New Character After Death**`,
      ``,
      `**CK System:**`,
      `When your character is permanently killed (CK), you can create a new character.`,
      ``,
      `**What you need:**`,
      `✓ Previous character name (deceased)`,
      `✓ New character name (desired)`,
      `✓ Proof of CK (if applicable)`,
      ``,
      `**Rules:**`,
      `>  New character must be completely different`,
      `>  No memory of previous character`,
      `>  Fresh start with new identity`,
      `>  Admin verification required`,
      ``,
      `-# CK requests are processed within 24 hours`,
    ],
    banner: "https://i.imgur.com/Qx8mZJ3.png",
    button: component.secondary_button("💀 Character Killed", "ticket_ck"),
  },
}

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("setup-ticket")
    .setDescription("Setup a specific ticket category in this channel")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Type of ticket system to setup")
        .setRequired(true)
        .addChoices(
          { name: "💸 Donate", value: "donate" },
          { name: "🚨 Report Player", value: "report_player" },
          { name: "🐛 Report Bug", value: "report_bug" },
          { name: "👮 Report Staff", value: "report_staff" },
          { name: "📖 Character Story (CS)", value: "cs" },
          { name: "💀 Character Killed (CK)", value: "ck" }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction) {
    // Defer reply immediately to prevent timeout
    await interaction.deferReply({ flags: 64 })

    const ticketType = interaction.options.getString("type", true)
    const config = TICKET_CONFIGS[ticketType as keyof typeof TICKET_CONFIGS]

    if (!config) {
      await interaction.editReply({
        content: "❌ Invalid ticket type!",
      })
      return
    }

    // Update status
    await interaction.editReply({
      content: "⏳ Setting up ticket panel...",
    })

    const channel = interaction.channel as TextChannel

    // Build message using Discord Components v2 (transparent background)
    const containerComponents: any[] = []
    
    // Add sections with dividers
    if (config.sections) {
      config.sections.forEach((section, index) => {
        // Add thumbnail to first section
        if (index === 0) {
          containerComponents.push(component.section({
            content: section,
            thumbnail: ticket_thumb_url,
          }))
        } else {
          containerComponents.push(component.text(section))
        }
        
        if (index < config.sections.length - 1) {
          containerComponents.push(component.divider(2))
        }
      })
    } else {
      // Fallback for configs without sections
      containerComponents.push(component.section({
        content: config.content,
        thumbnail: ticket_thumb_url,
      }))
    }
    
    // Add banner and button
    containerComponents.push(component.divider(2))
    containerComponents.push(component.media_gallery([
      component.gallery_item(config.banner),
    ]))
    containerComponents.push(component.divider(2))
    containerComponents.push(component.action_row(config.button))

    const message = component.build_message({
      components: [
        component.container({
          components: containerComponents,
        }),
      ],
    })

    // Send using Discord API v10
    const response = await api.send_components_v2(channel.id, api.get_token(), message)

    if (!response.error) {
      await interaction.editReply({
        content: `✅ **${config.title}** ticket panel has been setup in this channel!`,
      })
    } else {
      console.error("[setup-ticket] Error:", response.error)
      await interaction.editReply({
        content: "❌ Failed to send ticket panel.",
      })
    }
  },
}
