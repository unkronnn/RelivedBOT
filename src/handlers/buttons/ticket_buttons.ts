import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ThreadChannel,
  ChannelType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js"

const TICKET_COLORS = {
  donate: 0x57F287,       // Green
  report_player: 0xED4245, // Red
  report_bug: 0xFEE75C,   // Yellow
  report_staff: 0xED4245, // Red
  cs: 0x5865F2,           // Blue
  ck: 0xEB459E,           // Pink
}

const TICKET_CODES = {
  donate: "DONATE",
  report_player: "REP-PLAYER",
  report_bug: "BUG",
  report_staff: "REP-STAFF",
  cs: "CS",
  ck: "CK",
}

export async function handle_ticket_buttons(interaction: ButtonInteraction): Promise<boolean> {
  const customId = interaction.customId

  // Ticket creation buttons
  if (customId === "ticket_donate") {
    await show_donate_modal(interaction)
    return true
  }
  
  if (customId === "ticket_report_player") {
    await show_report_player_modal(interaction)
    return true
  }
  
  if (customId === "ticket_report_bug") {
    await show_report_bug_modal(interaction)
    return true
  }
  
  if (customId === "ticket_report_staff") {
    await show_report_staff_modal(interaction)
    return true
  }
  
  if (customId === "ticket_cs") {
    await show_cs_modal(interaction)
    return true
  }
  
  if (customId === "ticket_ck") {
    await show_ck_modal(interaction)
    return true
  }

  // Staff join button (from log channel)
  if (customId.startsWith("btn_join_ticket:")) {
    await handle_staff_join(interaction)
    return true
  }

  // Ticket action buttons
  if (customId.startsWith("ticket_claim:")) {
    await handle_ticket_claim(interaction)
    return true
  }

  if (customId.startsWith("ticket_close:") || customId.startsWith("btn_close_")) {
    await handle_ticket_close(interaction)
    return true
  }

  // Close request buttons
  if (customId.startsWith("close_accept:")) {
    await handle_close_accept(interaction)
    return true
  }

  if (customId.startsWith("close_deny:")) {
    await handle_close_deny(interaction)
    return true
  }

  if (customId.startsWith("ticket_reopen:")) {
    await handle_ticket_reopen(interaction)
    return true
  }

  if (customId.startsWith("btn_reopen_log_")) {
    await handle_reopen_from_log(interaction)
    return true
  }

  return false
}

// Modal creators
async function show_donate_modal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("ticket_modal_donate")
    .setTitle("💰 Donate Ticket")

  const ucpInput = new TextInputBuilder()
    .setCustomId("ucp_name")
    .setLabel("Nama UCP")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

  const ingameInput = new TextInputBuilder()
    .setCustomId("ingame_name")
    .setLabel("Nama Ingame")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

  const donateInput = new TextInputBuilder()
    .setCustomId("donate_what")
    .setLabel("Ingin Donate Apa")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(500)

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(ucpInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(ingameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(donateInput)
  )

  await interaction.showModal(modal)
}

async function show_report_player_modal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("ticket_modal_report_player")
    .setTitle("👤 Report Player")

  const playerInput = new TextInputBuilder()
    .setCustomId("player_name")
    .setLabel("Nama Player Pelaku")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

  const reasonInput = new TextInputBuilder()
    .setCustomId("reason")
    .setLabel("Alasan / Kronologi")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000)

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(playerInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput)
  )

  await interaction.showModal(modal)
}

async function show_report_bug_modal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("ticket_modal_report_bug")
    .setTitle("🐛 Report Bug")

  const detailInput = new TextInputBuilder()
    .setCustomId("bug_detail")
    .setLabel("Detail Bug")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000)

  const proofInput = new TextInputBuilder()
    .setCustomId("proof_link")
    .setLabel("Link Bukti (Screenshot/Video)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(200)

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(detailInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(proofInput)
  )

  await interaction.showModal(modal)
}

async function show_report_staff_modal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("ticket_modal_report_staff")
    .setTitle("👮 Report Staff")

  const staffInput = new TextInputBuilder()
    .setCustomId("staff_name")
    .setLabel("Nama Staff")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

  const issueInput = new TextInputBuilder()
    .setCustomId("issue")
    .setLabel("Issue / Masalah")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000)

  const proofInput = new TextInputBuilder()
    .setCustomId("proof_link")
    .setLabel("Link Bukti (Screenshot/Video)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(200)

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(staffInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(issueInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(proofInput)
  )

  await interaction.showModal(modal)
}

async function show_cs_modal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("ticket_modal_cs")
    .setTitle("📖 Character Story (CS)")

  const ucpInput = new TextInputBuilder()
    .setCustomId("ucp_name")
    .setLabel("Nama UCP")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

  const characterInput = new TextInputBuilder()
    .setCustomId("character_name")
    .setLabel("Nama IC")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(ucpInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(characterInput)
  )

  await interaction.showModal(modal)
}

async function show_ck_modal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("ticket_modal_ck")
    .setTitle("💀 Character Killed (CK)")

  const ucpInput = new TextInputBuilder()
    .setCustomId("ucp_name")
    .setLabel("Nama UCP")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

  const oldCharInput = new TextInputBuilder()
    .setCustomId("old_character")
    .setLabel("Nama IC Lama (Yang di-CK)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

  const newCharInput = new TextInputBuilder()
    .setCustomId("new_character")
    .setLabel("Nama IC Baru (Request)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(ucpInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(oldCharInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(newCharInput)
  )

  await interaction.showModal(modal)
}

// Staff join handler (from log channel)
async function handle_staff_join(interaction: ButtonInteraction) {
  const threadId = interaction.customId.split(":")[1]

  try {
    await interaction.deferReply({ ephemeral: true })

    // Fetch the thread
    const thread = await interaction.client.channels.fetch(threadId) as ThreadChannel

    if (!thread || !thread.isThread()) {
      await interaction.editReply({
        content: "❌ Thread tidak ditemukan atau sudah dihapus.",
      })
      return
    }

    // Add staff to thread
    await thread.members.add(interaction.user.id)

    // Send system message in thread
    await thread.send({
      content: `🚀 Staff <@${interaction.user.id}> has joined the ticket.`,
    })

    // Reply to staff
    await interaction.editReply({
      content: `✅ You have joined the ticket: <#${thread.id}>`,
    })

    console.log(`[TICKET] Staff ${interaction.user.tag} joined thread ${thread.id}`)

  } catch (error: any) {
    console.error("[TICKET] Error joining thread:", error)
    
    await interaction.editReply({
      content: `❌ Error joining thread: ${error.message || "Unknown error"}`,
    }).catch(() => {})
  }
}

// Ticket action handlers
async function handle_ticket_claim(interaction: ButtonInteraction) {
  if (!interaction.channel?.isThread()) return

  const thread = interaction.channel as ThreadChannel
  
  await interaction.deferUpdate()

  // Get the ticket embed message (first message in thread)
  const messages = await thread.messages.fetch({ limit: 10 })
  const ticketMessage = messages.find(m => m.embeds.length > 0 && m.author.id === interaction.client.user.id)

  if (ticketMessage && ticketMessage.embeds[0]) {
    const embed = EmbedBuilder.from(ticketMessage.embeds[0])
    
    // Add "Handled by" field
    embed.addFields({
      name: "✋ Handled by",
      value: `<@${interaction.user.id}>`,
      inline: true,
    })

    // Update the embed
    await ticketMessage.edit({ embeds: [embed] })

    // Disable claim button
    const components = ticketMessage.components
    if (components[0]) {
      const row = components[0].toJSON()
      row.components.forEach((button: any) => {
        if (button.custom_id?.startsWith("ticket_claim")) {
          button.disabled = true
        }
      })
      await ticketMessage.edit({ components: [row] })
    }
  }

  // Send reply message
  await thread.send({
    content: `✋ Ticket claimed by <@${interaction.user.id}>`,
  })
}

async function handle_ticket_close(interaction: ButtonInteraction) {
  if (!interaction.channel?.isThread()) return

  const thread = interaction.channel as ThreadChannel
  
  // Extract Owner ID from button CustomID: btn_close_<OWNER_ID> or ticket_close:<OWNER_ID>
  let ownerId: string | undefined
  
  if (interaction.customId.startsWith("btn_close_")) {
    ownerId = interaction.customId.replace("btn_close_", "")
  } else if (interaction.customId.startsWith("ticket_close:")) {
    ownerId = interaction.customId.split(":")[1]
  }
  
  if (!ownerId) {
    await interaction.reply({
      content: `❌ Cannot close ticket: Owner ID not found in button.`,
      ephemeral: true,
    })
    return
  }
  
  console.log(`[TICKET] Closing ticket - Owner ID: ${ownerId}, Staff: ${interaction.user.id}`)

  await interaction.reply({
    content: `🔒 Closing ticket...`,
    ephemeral: true,
  })

  try {
    // Force fetch members to ensure we see the user who just re-joined
    await thread.members.fetch()
    
    // Step 1: Kick TARGET user from thread (NOT the staff member clicking)
    // CRITICAL: Only kick the owner, never kick staff
    if (ownerId !== interaction.user.id) {
      const targetMember = await thread.members.fetch(ownerId).catch(() => null)
      if (targetMember) {
        await thread.members.remove(ownerId)
        console.log(`[TICKET] ✅ Kicked owner ${ownerId} from thread ${thread.id}`)
      } else {
        console.log(`[TICKET] ⚠️ Owner ${ownerId} not found in thread, skipping kick`)
      }
    } else {
      console.log(`[TICKET] ⚠️ Owner ID matches staff ID, skipping kick to prevent self-kick`)
    }
    
    // Step 2: Rename thread with Rate Limit Handling
    const cleanName = thread.name.replace(/^\[CLOSED\]\s*-\s*/, "")
    const newName = `[CLOSED] - ${cleanName}`
    
    // Truncate if exceeds 100 characters
    const finalName = newName.length > 100 ? newName.substring(0, 97) + "..." : newName
    
    try {
      await thread.setName(finalName)
      console.log(`[TICKET] ✅ Renamed thread to: ${finalName}`)
    } catch (renameError: any) {
      console.log(`[TICKET] ⚠️ Rate limit hit for rename, skipping rename but proceeding with close.`)
      console.error(`[TICKET] Rename error:`, renameError.message)
    }
    
    // Step 3: Send Log to Close Ticket channel
    await log_ticket_closed(interaction, thread, ownerId)
    
    await thread.send({
      embeds: [{
        title: "🔒 Ticket Closed",
        description: `Ticket ditutup oleh <@${interaction.user.id}>`,
        color: 0x5865F2,
        timestamp: new Date().toISOString(),
      }],
    })

    // Step 4: Archive and lock thread (ALWAYS execute regardless of rename success)
    await thread.setArchived(true)
    await thread.setLocked(true)
    console.log(`[TICKET] ✅ Thread ${thread.id} archived and locked`)
    
  } catch (error) {
    console.error("[TICKET] Error force closing ticket:", error)
  }
}

async function handle_close_accept(interaction: ButtonInteraction) {
  const requesterId = interaction.customId.split(":")[1]

  await interaction.update({
    embeds: [{
      title: "✅ Permintaan Penutupan Diterima",
      description: `Diterima oleh <@${interaction.user.id}>`,
      color: 0x57F287,
      timestamp: new Date().toISOString(),
    }],
    components: [],
  })

  if (interaction.channel?.isThread()) {
    const thread = interaction.channel as ThreadChannel
    
    try {
      // Step B: Kick user from thread (revoke access)
      await thread.members.remove(requesterId)
      console.log(`[TICKET] Removed user ${requesterId} from thread ${thread.id}`)
      
      // Step A: Rename thread to [CLOSED] - [Original Name] (max 100 chars)
      let newName = thread.name.startsWith("[CLOSED]") 
        ? thread.name 
        : `[CLOSED] - ${thread.name}`
      
      // Truncate if exceeds 100 characters
      if (newName.length > 100) {
        newName = newName.substring(0, 97) + "..."
      }
      
      await thread.setName(newName)
      
      // Send re-open button
      const reopenButton = new ButtonBuilder()
        .setCustomId(`ticket_reopen:${requesterId}`)
        .setLabel("Re-Open Ticket")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔓")
      
      const reopenRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(reopenButton)
      
      // Step C: Send Log to Close Ticket channel (before archiving)
      await log_ticket_closed(interaction, thread, requesterId)
      
      // Send re-open button in thread
      await thread.send({
        embeds: [{
          title: "🔒 Ticket Closed",
          description: `Ticket ditutup oleh <@${interaction.user.id}>\n\nStaff dapat membuka kembali ticket dengan tombol di bawah.`,
          color: 0x5865F2,
          timestamp: new Date().toISOString(),
        }],
        components: [reopenRow],
      })
      
      // Step D: Archive and lock thread
      await thread.setArchived(true)
      await thread.setLocked(true)
      
    } catch (error) {
      console.error("[TICKET] Error closing ticket:", error)
    }
  }
}

async function handle_close_deny(interaction: ButtonInteraction) {
  const requesterId = interaction.customId.split(":")[1]

  await interaction.update({
    embeds: [{
      title: "❌ Permintaan Penutupan Ditolak",
      description: `Ditolak oleh <@${interaction.user.id}>`,
      color: 0xED4245,
      timestamp: new Date().toISOString(),
    }],
    components: [],
  })

  await interaction.followUp({
    content: `❌ Permintaan penutupan ditolak. Ticket tetap terbuka.`,
  })
}

async function handle_ticket_reopen(interaction: ButtonInteraction) {
  if (!interaction.channel?.isThread()) return
  
  const thread = interaction.channel as ThreadChannel
  const originalUserId = interaction.customId.split(":")[1]
  
  if (!originalUserId) {
    await interaction.reply({
      content: "❌ Cannot re-open: Owner ID not found.",
      ephemeral: true,
    })
    return
  }
  
  console.log(`[TICKET] Re-opening ticket - Owner ID: ${originalUserId}, Staff: ${interaction.user.id}`)
  
  try {
    // Step 1: Unarchive and unlock
    await thread.setArchived(false)
    await thread.setLocked(false)
    console.log(`[TICKET] ✅ Thread ${thread.id} unarchived and unlocked`)
    
    // Step 2: Rename thread with Rate Limit Handling
    const cleanName = thread.name.replace(/^\[CLOSED\]\s*-\s*/, "")
    
    try {
      await thread.setName(cleanName)
      console.log(`[TICKET] ✅ Renamed thread to: ${cleanName}`)
    } catch (renameError: any) {
      console.log(`[TICKET] ⚠️ Rate limit hit for rename, skipping rename but proceeding with re-open.`)
      console.error(`[TICKET] Rename error:`, renameError.message)
    }
    
    // Step 3: Add user back
    try {
      await thread.members.add(originalUserId)
      console.log(`[TICKET] ✅ Added user ${originalUserId} back to thread`)
    } catch (addError: any) {
      console.error(`[TICKET] Failed to add user back:`, addError.message)
    }
    
    // Step 4: Send NEW Close Button with CONSISTENT owner ID (btn_close_ format)
    const claimButton = new ButtonBuilder()
      .setCustomId(`ticket_claim:${thread.id}`)
      .setLabel("Claim Ticket")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("✋")

    const closeButton = new ButtonBuilder()
      .setCustomId(`btn_close_${originalUserId}`)
      .setLabel("Close Ticket")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🔒")

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(claimButton, closeButton)
    
    await interaction.reply({
      content: `♻️ **Ticket Re-opened!**\nUser <@${originalUserId}> has been added back.\nRe-opened by <@${interaction.user.id}>`,
      components: [actionRow],
    })
    
    console.log(`[TICKET] ✅ Thread ${thread.id} successfully re-opened by ${interaction.user.tag}`)
    
  } catch (error) {
    console.error("[TICKET] Error re-opening ticket:", error)
    await interaction.reply({
      content: "❌ Failed to re-open ticket.",
      ephemeral: true,
    })
  }
}

async function handle_reopen_from_log(interaction: ButtonInteraction) {
  try {
    // Parse threadId and ticketOwnerId from CustomID: btn_reopen_log_<threadId>_<ticketOwnerId>
    const parts = interaction.customId.split("_")
    const threadId = parts[3]
    const ticketOwnerId = parts[4]
    
    if (!threadId || !ticketOwnerId) {
      await interaction.reply({
        content: "❌ Invalid button data. Cannot re-open ticket.",
        ephemeral: true,
      })
      return
    }
    
    // Fetch the thread
    const thread = await interaction.client.channels.fetch(threadId) as ThreadChannel
    
    if (!thread || !thread.isThread()) {
      await interaction.reply({
        content: "❌ Thread not found or has been deleted.",
        ephemeral: true,
      })
      return
    }
    
    // Step 1: Unarchive and unlock
    await thread.setArchived(false)
    await thread.setLocked(false)
    console.log(`[TICKET] ✅ Thread ${threadId} unarchived and unlocked`)
    
    // Step 2: Rename thread with Rate Limit Handling
    const cleanName = thread.name.replace(/^\[CLOSED\]\s*-\s*/, "")
    
    try {
      await thread.setName(cleanName)
      console.log(`[TICKET] ✅ Renamed thread to: ${cleanName}`)
    } catch (renameError: any) {
      console.log(`[TICKET] ⚠️ Rate limit hit for rename, skipping rename but proceeding with re-open.`)
      console.error(`[TICKET] Rename error:`, renameError.message)
    }
    
    // Restore member - Add user back to thread
    try {
      await thread.members.add(ticketOwnerId)
      console.log(`[TICKET] Restored user ${ticketOwnerId} to thread ${threadId} from log channel`)
    } catch (memberError: any) {
      // User might have left the server
      console.error(`[TICKET] Failed to add user ${ticketOwnerId} back to thread:`, memberError.message)
      
      await interaction.reply({
        content: `⚠️ Ticket re-opened, but could not add user <@${ticketOwnerId}> back.\nThey may have left the server.`,
        ephemeral: true,
      })
      
      // Send notification in thread with close button anyway (btn_close_ format)
      const claimButton = new ButtonBuilder()
        .setCustomId(`ticket_claim:${thread.id}`)
        .setLabel("Claim Ticket")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("✋")

      const closeButton = new ButtonBuilder()
        .setCustomId(`btn_close_${ticketOwnerId}`)
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔒")

      const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(claimButton, closeButton)
      
      await thread.send({
        content: `♻️ **Ticket Re-opened!**\nUser <@${ticketOwnerId}> could not be added back (may have left server).\nRe-opened by <@${interaction.user.id}>`,
        components: [actionRow],
      })
      
      // Disable the button to prevent spam (simplified)
      try {
        const components = interaction.message.components
        const updatedComponents = components.map(row => {
          const actionRow = ActionRowBuilder.from(row as any)
          actionRow.components.forEach((component: any) => {
            if (component.data?.custom_id === interaction.customId) {
              component.setDisabled(true)
            }
          })
          return actionRow
        })
        
        await interaction.message.edit({ components: updatedComponents as any })
      } catch (editError) {
        console.error("[TICKET] Failed to disable re-open button:", editError)
      }
      
      return
    }
    
    // Feedback in log channel (ephemeral)
    await interaction.reply({
      content: `✅ Ticket re-opened and user <@${ticketOwnerId}> has been restored.`,
      ephemeral: true,
    })
    
    // Send NEW Close Button with CONSISTENT owner ID (btn_close_ format)
    const claimButton = new ButtonBuilder()
      .setCustomId(`ticket_claim:${thread.id}`)
      .setLabel("Claim Ticket")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("✋")

    const closeButton = new ButtonBuilder()
      .setCustomId(`btn_close_${ticketOwnerId}`)
      .setLabel("Close Ticket")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("🔒")

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(claimButton, closeButton)
    
    await thread.send({
      content: `♻️ **Ticket Re-opened!**\nUser <@${ticketOwnerId}> has been added back to the session.\nRe-opened by <@${interaction.user.id}>`,
      components: [actionRow],
    })
    
    // Disable the re-open button to prevent spam
    try {
      const components = interaction.message.components
      const updatedComponents = components.map(row => {
        const actionRow = ActionRowBuilder.from(row as any)
        actionRow.components.forEach((component: any) => {
          if (component.data?.custom_id === interaction.customId) {
            component.setDisabled(true)
          }
        })
        return actionRow
      })
      
      await interaction.message.edit({ components: updatedComponents as any })
    } catch (editError) {
      console.error("[TICKET] Failed to disable re-open button:", editError)
    }
    
    console.log(`[TICKET] Thread ${threadId} re-opened from log channel by ${interaction.user.tag}`)
    
  } catch (error) {
    console.error("[TICKET] Error re-opening ticket from log:", error)
    await interaction.reply({
      content: "❌ Failed to re-open ticket. Please check logs.",
      ephemeral: true,
    }).catch(() => {})
  }
}

async function log_ticket_closed(interaction: ButtonInteraction, thread: ThreadChannel, userId: string) {
  try {
    // Step C: Send Log Embed to specific channel
    const closeLogChannelId = "1461568961383633002"
    
    const logChannel = await interaction.client.channels.fetch(closeLogChannelId) as TextChannel
    if (!logChannel || logChannel.type !== ChannelType.GuildText) {
      console.error(`[TICKET] Close log channel ${closeLogChannelId} not found`)
      return
    }
    
    console.log(`[TICKET] Sending close log for ${thread.name}`)
    
    // Payment_method.ts style embed
    const logEmbed = new EmbedBuilder()
      .setTitle("📕 Ticket Closed")
      .addFields(
        { name: "Ticket Name", value: thread.name, inline: false },
        { name: "Closed By", value: `<@${interaction.user.id}>`, inline: true },
        { name: "Ticket Owner", value: `<@${userId}>`, inline: true },
        { name: "Timestamp", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false }
      )
      .setColor(0x5865F2)
      .setTimestamp()
    
    // Jump to Thread button
    const jumpButton = new ButtonBuilder()
      .setLabel("Jump to Thread")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${thread.guildId}/${thread.id}`)
    
    // Re-Open button with threadId and userId in CustomID
    const reopenButton = new ButtonBuilder()
      .setCustomId(`btn_reopen_log_${thread.id}_${userId}`)
      .setLabel("Re-Open Ticket")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🔓")
    
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(jumpButton, reopenButton)
    
    await logChannel.send({
      embeds: [logEmbed],
      components: [row],
    })
    
    console.log(`[TICKET] Close log sent successfully for ${thread.name}`)
  } catch (error) {
    console.error("[TICKET] Error logging closed ticket:", error)
  }
}

export { TICKET_COLORS, TICKET_CODES }
