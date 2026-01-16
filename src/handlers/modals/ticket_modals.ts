import {
  ModalSubmitInteraction,
  ChannelType,
  TextChannel,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js"
import { TICKET_COLORS, TICKET_CODES } from "../buttons/ticket_buttons.js"

export async function handle_ticket_modals(interaction: ModalSubmitInteraction): Promise<boolean> {
  const customId = interaction.customId

  if (customId === "ticket_modal_donate") {
    await create_ticket(interaction, "donate", {
      title: "💰 Donation Ticket",
      fields: [
        {
          name: "Nama UCP",
          value: interaction.fields.getTextInputValue("ucp_name"),
          inline: true,
        },
        {
          name: "Nama Ingame",
          value: interaction.fields.getTextInputValue("ingame_name"),
          inline: true,
        },
        {
          name: "Ingin Donate Apa",
          value: interaction.fields.getTextInputValue("donate_what"),
          inline: false,
        },
      ],
    })
    return true
  }

  if (customId === "ticket_modal_report_player") {
    await create_ticket(interaction, "report_player", {
      title: "👤 Report Player Ticket",
      fields: [
        {
          name: "Nama Player Pelaku",
          value: interaction.fields.getTextInputValue("player_name"),
          inline: false,
        },
        {
          name: "Alasan / Kronologi",
          value: interaction.fields.getTextInputValue("reason"),
          inline: false,
        },
      ],
    })
    return true
  }

  if (customId === "ticket_modal_report_bug") {
    const proofLink = interaction.fields.getTextInputValue("proof_link") || "Tidak ada"
    
    await create_ticket(interaction, "report_bug", {
      title: "🐛 Bug Report Ticket",
      fields: [
        {
          name: "Detail Bug",
          value: interaction.fields.getTextInputValue("bug_detail"),
          inline: false,
        },
        {
          name: "Link Bukti",
          value: proofLink,
          inline: false,
        },
      ],
    })
    return true
  }

  if (customId === "ticket_modal_report_staff") {
    const proofLink = interaction.fields.getTextInputValue("proof_link") || "Tidak ada"
    
    await create_ticket(interaction, "report_staff", {
      title: "👮 Report Staff Ticket",
      fields: [
        {
          name: "Nama Staff",
          value: interaction.fields.getTextInputValue("staff_name"),
          inline: true,
        },
        {
          name: "Issue / Masalah",
          value: interaction.fields.getTextInputValue("issue"),
          inline: false,
        },
        {
          name: "Link Bukti",
          value: proofLink,
          inline: false,
        },
      ],
    })
    return true
  }

  if (customId === "ticket_modal_cs") {
    await create_ticket(interaction, "cs", {
      title: "📖 Character Story Ticket",
      fields: [
        {
          name: "Nama UCP",
          value: interaction.fields.getTextInputValue("ucp_name"),
          inline: true,
        },
        {
          name: "Nama IC",
          value: interaction.fields.getTextInputValue("character_name"),
          inline: true,
        },
      ],
    })
    return true
  }

  if (customId === "ticket_modal_ck") {
    await create_ticket(interaction, "ck", {
      title: "💀 Character Killed Ticket",
      fields: [
        {
          name: "Nama UCP",
          value: interaction.fields.getTextInputValue("ucp_name"),
          inline: true,
        },
        {
          name: "Nama IC Lama (Yang di-CK)",
          value: interaction.fields.getTextInputValue("old_character"),
          inline: true,
        },
        {
          name: "Nama IC Baru (Request)",
          value: interaction.fields.getTextInputValue("new_character"),
          inline: true,
        },
      ],
    })
    return true
  }

  return false
}

async function create_ticket(
  interaction: ModalSubmitInteraction,
  category: keyof typeof TICKET_COLORS,
  embedData: { title: string; fields: Array<{ name: string; value: string; inline: boolean }> }
) {
  await interaction.deferReply({ ephemeral: true })

  try {
    // Get the channel where button was clicked (same channel)
    const channel = interaction.channel as TextChannel

    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.editReply({
        content: "❌ This command can only be used in text channels!",
      })
      return
    }

    // Create thread name
    const code = TICKET_CODES[category]
    const userName = interaction.user.username
    const threadName = `${code} - ${userName}`

    // Create private thread in the SAME channel
    const thread = await channel.threads.create({
      name: threadName,
      autoArchiveDuration: 1440, // 24 hours
      type: ChannelType.PrivateThread,
      reason: `Ticket created by ${interaction.user.tag}`,
    })

    // Add user to thread
    await thread.members.add(interaction.user.id)

    // Build ticket embed (transparent - no color)
    const ticketEmbed = new EmbedBuilder()
      .setTitle(embedData.title)
      .setDescription(
        `**Ticket Owner:** <@${interaction.user.id}>\n` +
        `**Created:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
        embedData.fields.map(f => `**${f.name}**\n${f.value}`).join('\n\n') +
        `\n\n───────────────────────────\n\n` +
        `*Ticket ID: ${thread.id}*`
      )
      .setTimestamp()

    // Create action buttons (transparent style)
    const claimButton = new ButtonBuilder()
      .setCustomId(`ticket_claim:${thread.id}`)
      .setLabel("Claim Ticket")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("✋")

    const closeButton = new ButtonBuilder()
      .setCustomId(`btn_close_${interaction.user.id}`)
      .setLabel("Close Ticket")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🔒")

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(claimButton, closeButton)

    // Send ticket message in thread
    await thread.send({
      embeds: [ticketEmbed],
      components: [actionRow],
    })

    // Send payment info for donate tickets
    if (category === "donate") {
      await send_payment_info(thread)
    }

    // Send log to staff channel
    await send_staff_log(interaction, thread, category, embedData)

    // Reply to user
    await interaction.editReply({
      content: `✅ Ticket berhasil dibuat! <#${thread.id}>`,
    })

  } catch (error) {
    console.error("[TICKET] Error creating ticket:", error)
    await interaction.editReply({
      content: "❌ Terjadi error saat membuat ticket. Silakan coba lagi.",
    })
  }
}

async function send_payment_info(thread: any) {
  try {
    const paymentEmbed = new EmbedBuilder()
      .setTitle("💳 Payment Methods")
      .setDescription(
        `**Silakan transfer ke salah satu metode pembayaran:**\n\n` +
        `**Gopay**\n\`085348552780\`\n\n` +
        `**Shopee**\n\`085348552780\`\n\n` +
        `**Dana**\n\`085348552780\`\n\n` +
        `───────────────────────────\n\n` +
        `*Setelah transfer, kirim bukti pembayaran di ticket ini.*`
      )
      .setTimestamp()

    await thread.send({
      embeds: [paymentEmbed],
    })

    console.log("[TICKET] Payment info sent to donate ticket")
  } catch (error) {
    console.error("[TICKET] Error sending payment info:", error)
  }
}

async function send_staff_log(
  interaction: ModalSubmitInteraction,
  thread: any,
  category: keyof typeof TICKET_COLORS,
  embedData: { title: string; fields: Array<{ name: string; value: string; inline: boolean }> }
) {
  try {
    const staffLogChannelId = process.env.STAFF_LOG_CHANNEL_ID
    
    console.log("[TICKET] Staff Log Channel ID:", staffLogChannelId)
    
    if (!staffLogChannelId) {
      console.warn("[TICKET] STAFF_LOG_CHANNEL_ID not configured")
      return
    }

    const staffChannel = await interaction.client.channels.fetch(staffLogChannelId) as TextChannel

    if (!staffChannel || staffChannel.type !== ChannelType.GuildText) {
      console.warn("[TICKET] Staff log channel not found or not a text channel")
      return
    }

    const code = TICKET_CODES[category]
    const ticketId = thread.id.slice(-6)

    console.log(`[TICKET] Sending staff log for ${code}-${ticketId}`)

    // Use standard embed (transparent - no color)
    const logEmbed = new EmbedBuilder()
      .setTitle("🎫 New Ticket Created")
      .addFields(
        { name: "Ticket Code", value: `\`${code}-${ticketId}\``, inline: true },
        { name: "Type", value: embedData.title, inline: true },
        { name: "Created By", value: `<@${interaction.user.id}>`, inline: true },
        { name: "Thread", value: `<#${thread.id}>`, inline: false },
        { name: "Created", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      )
      .setTimestamp()

    // Add preview fields
    if (embedData.fields.length > 0) {
      const previewText = embedData.fields
        .slice(0, 2)
        .map(f => `>  **${f.name}:** ${f.value.slice(0, 100)}${f.value.length > 100 ? '...' : ''}`)
        .join('\n')
      logEmbed.addFields({ name: "Preview", value: previewText, inline: false })
    }

    // Join button (transparent style)
    const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = await import("discord.js")
    
    const joinButton = new ButtonBuilder()
      .setCustomId(`btn_join_ticket:${thread.id}`)
      .setLabel("Join Ticket")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🚀")

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(joinButton)

    await staffChannel.send({
      embeds: [logEmbed],
      components: [row],
    })

    console.log(`[TICKET] Staff log sent successfully for ${code}-${ticketId}`)

  } catch (error) {
    console.error("[TICKET] Error sending staff log:", error)
  }
}
