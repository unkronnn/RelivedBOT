import { Client, GatewayIntentBits, Collection, Partials } from "discord.js"
import { config } from "dotenv"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { readdirSync } from "fs"

// Load environment variables
config()

// Define command interface
interface Command {
  data: {
    name: string
    [key: string]: any
  }
  execute: (interaction: any) => Promise<void>
}

// Extend Client type
declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>
  }
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildIntegrations,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction,
  ],
})

// Initialize commands collection
client.commands = new Collection()

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load commands function
async function loadCommands(dir: string = join(__dirname, "commands")) {
  const commandFolders = [
    "music",
    "moderation",
    "server",
    "staff",
  ]

  console.log("[COMMANDS] Loading commands...")

  for (const folder of commandFolders) {
    const folderPath = join(dir, folder)
    
    try {
      const files = readdirSync(folderPath).filter(file => 
        file.endsWith(".ts") || file.endsWith(".js")
      )

      for (const file of files) {
        const filePath = join(folderPath, file)
        
        try {
          const commandModule = await import(`file://${filePath}`)
          const command = commandModule.command || commandModule.default

          if (command && command.data && command.data.name) {
            client.commands.set(command.data.name, command)
            console.log(`[COMMANDS] Loaded: ${command.data.name}`)
          }
        } catch (error) {
          // Silently skip commands with import errors
        }
      }
    } catch (error) {
      // Folder doesn't exist, skip
    }
  }

  console.log(`[COMMANDS] Loaded ${client.commands.size} commands`)
}

// Basic ready event
client.once("ready", async () => {
  console.log("=".repeat(50))
  console.log(`✓ Logged in as ${client.user?.tag}`)
  console.log(`✓ Serving ${client.guilds.cache.size} guild(s)`)
  console.log(`✓ Ready to respond to commands!`)
  console.log("=".repeat(50))
  
  // Auto-detect TempVoice generator channel
  try {
    const tempvoice = await import("../shared/database/services/tempvoice.js")
    for (const guild of client.guilds.cache.values()) {
      await tempvoice.auto_detect_generator(guild)
    }
  } catch (error) {
    console.error("[TEMPVOICE] Failed to auto-detect generator:", error)
  }
})

// Handle member join for welcomer
client.on("guildMemberAdd", async (member) => {
  try {
    const { handle_member_join } = await import("./handlers/events/welcomer.js")
    await handle_member_join(member)
  } catch (error) {
    console.error("[WELCOMER] Failed to handle member join:", error)
  }
})

// Handle member update for booster logging
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  try {
    const { handle_boost_update } = await import("./handlers/events/booster_log.js")
    await handle_boost_update(oldMember, newMember)
  } catch (error) {
    console.error("[BOOSTER] Failed to handle member update:", error)
  }
})

// Basic interaction handler
client.on("interactionCreate", async (interaction) => {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName)

    if (!command) {
      console.log(`[WARNING] Command not found: ${interaction.commandName}`)
      return
    }

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(`[ERROR] Command execution failed: ${interaction.commandName}`, error)
      
      const errorMessage = {
        content: "An error occurred while executing this command.",
        ephemeral: true,
      }

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage)
      } else {
        await interaction.reply(errorMessage)
      }
    }
  }
  
  // Handle buttons
  else if (interaction.isButton()) {
    try {
      // Handle ticket buttons
      const { handle_ticket_buttons } = await import("./handlers/buttons/ticket_buttons.js")
      const ticketHandled = await handle_ticket_buttons(interaction)
      
      if (ticketHandled) {
        return
      }

      // Handle booster claim button
      if (interaction.customId.startsWith("booster_claim_")) {
        const { handle } = await import("./handlers/interactions/booster_claim.js")
        await handle(interaction)
        return
      }

      // Handle tempvoice buttons
      const { handle_tempvoice_buttons } = await import("./handlers/buttons/tempvoice_buttons.js")
      const tempvoiceHandled = await handle_tempvoice_buttons(interaction)
      
      if (tempvoiceHandled) {
        return
      }
      
      console.log(`[WARNING] Unhandled button: ${interaction.customId}`)
    } catch (error) {
      console.error("[ERROR] Button handler failed:", error)
    }
  }
  
  // Handle select menus
  else if (interaction.isStringSelectMenu()) {
    try {
      if (interaction.customId.startsWith("music_play_select")) {
        const { handle_music_play_select } = await import("./handlers/select-menus/play_select.js")
        await handle_music_play_select(interaction)
      }
      else if (interaction.customId === "music_select") {
        const { handle_music_select } = await import("./handlers/select-menus/music_select.js")
        await handle_music_select(interaction)
      }
      else if (interaction.customId.startsWith("tempvoice_")) {
        const { handle_tempvoice_user_select } = await import("./handlers/select-menus/user_select.js")
        await handle_tempvoice_user_select(interaction)
      }
      else if (interaction.customId.startsWith("payment_")) {
        const { handle_payment_method_select } = await import("./handlers/select-menus/payment_method.js")
        await handle_payment_method_select(interaction)
      }
      else if (interaction.customId.startsWith("answer_stats")) {
        const { handle_answer_stats_select } = await import("./handlers/select-menus/answer_stats.js")
        await handle_answer_stats_select(interaction)
      }
      else if (interaction.customId === "tempvoice_region_select") {
        const { handle_tempvoice_region_select } = await import("./handlers/select-menus/region_select.js")
        await handle_tempvoice_region_select(interaction)
      }
    } catch (error) {
      console.error("[ERROR] Select menu handler failed:", error)
    }
  }
  
  // Handle modals
  else if (interaction.isModalSubmit()) {
    try {
      // Handle ticket modals
      const { handle_ticket_modals } = await import("./handlers/modals/ticket_modals.js")
      const ticketHandled = await handle_ticket_modals(interaction)
      
      if (ticketHandled) {
        return
      }
      
      // Handle other modals
      if (interaction.customId.startsWith("tempvoice_")) {
        const { handle_tempvoice_modal } = await import("./handlers/modals/tempvoice.js")
        await handle_tempvoice_modal(interaction)
      }
      else if (interaction.customId.startsWith("music_modal")) {
        const { handle_music_modal } = await import("./handlers/modals/music_modal.js")
        await handle_music_modal(interaction)
      }
      else if (interaction.customId === "ask_staff_modal") {
        const { handle_ask_staff_modal } = await import("./handlers/modals/ask_staff.js")
        await handle_ask_staff_modal(interaction)
      }
      else if (interaction.customId === "loa_request_modal") {
        const { handle_loa_request_modal } = await import("./handlers/modals/loa_request.js")
        await handle_loa_request_modal(interaction)
      }
      else if (interaction.customId.startsWith("devlog_modal")) {
        const devlogModule = await import("./handlers/modals/devlog.js")
        await devlogModule.handle(interaction)
      }
      else if (interaction.customId.startsWith("edit_rules")) {
        const { handle_edit_rules_modal } = await import("./handlers/modals/edit_rules.js")
        await handle_edit_rules_modal(interaction)
      }
    } catch (error) {
      console.error("[ERROR] Modal handler failed:", error)
    }
  }
})

// Message events
client.on("messageCreate", async (message) => {
  if (message.author.bot) return
  
  // Announcement channel proxy
  const announcementChannelId = process.env.ANNOUNCEMENT_CHANNEL_ID
  if (announcementChannelId && message.channel.id === announcementChannelId) {
    try {
      // Copy message content
      const content = message.content || ""
      const embeds = message.embeds || []
      const attachments = Array.from(message.attachments.values())
      
      // Prepare message payload
      const payload: any = {}
      
      if (content) {
        payload.content = content
      }
      
      if (embeds.length > 0) {
        payload.embeds = embeds
      }
      
      if (attachments.length > 0) {
        payload.files = attachments.map(att => ({
          attachment: att.url,
          name: att.name
        }))
      }
      
      // Send message as bot
      if (Object.keys(payload).length > 0) {
        await message.channel.send(payload)
      }
      
      // Delete original message
      await message.delete()
      
      console.log(`[ANNOUNCEMENT] Proxied message from ${message.author.tag}`)
    } catch (error) {
      console.error("[ANNOUNCEMENT] Error proxying message:", error)
    }
    return
  }
  
  try {
    // Anti-spam check
    const { check_spam } = await import("./services/cache/anti_spam.js")
    const isSpam = check_spam(message, client)
    if (isSpam) return
  } catch (error) {
    // Anti-spam not available
  }
})

client.on("messageDelete", async (message) => {
  try {
    const { track_deleted_message } = await import("./services/cache/snipe.js")
    track_deleted_message(message)
  } catch (error) {
    // Snipe not available
  }
})

// Handle voice state updates for TempVoice
client.on("voiceStateUpdate", async (oldState, newState) => {
  try {
    const tempvoice = await import("../shared/database/services/tempvoice.js")
    const generator_id = tempvoice.get_generator_channel_id()

    console.log(`[TEMPVOICE] Voice update - Generator ID: ${generator_id}, New Channel: ${newState.channelId}, Old Channel: ${oldState.channelId}`)

    // User joined generator channel - create temp channel
    if (generator_id && newState.channelId === generator_id && newState.channelId !== oldState.channelId) {
      const member = newState.member!
      const guild = newState.guild
      const category = newState.channel?.parent

      if (!category) {
        console.log(`[TEMPVOICE] No category found for generator channel`)
        return
      }

      try {
        console.log(`[TEMPVOICE] Creating temp channel for ${member.user.tag}`)
        
        // Create temporary voice channel
        const temp_channel = await guild.channels.create({
          name: `${member.user.username}'s Channel`,
          type: 2, // Voice channel
          parent: category.id,
          userLimit: 0,
          permissionOverwrites: [
            {
              id: member.id,
              allow: ["ManageChannels", "MoveMembers", "MuteMembers", "DeafenMembers"],
            },
          ],
        })

        // Register channel
        tempvoice.register_temp_channel(temp_channel.id, member.id)

        // Move user to their channel
        await member.voice.setChannel(temp_channel)

        console.log(`[TEMPVOICE] Created channel ${temp_channel.id} for ${member.user.tag}`)
      } catch (error) {
        console.error("[TEMPVOICE] Failed to create temp channel:", error)
      }
    }

    // User left temp channel - delete if empty
    if (oldState.channel && tempvoice.is_temp_channel(oldState.channelId!)) {
      if (oldState.channel.members.size === 0) {
        try {
          await oldState.channel.delete()
          tempvoice.unregister_temp_channel(oldState.channelId!)
          console.log(`[TEMPVOICE] Deleted empty channel: ${oldState.channel.name}`)
        } catch (error) {
          console.error("[TEMPVOICE] Failed to delete empty channel:", error)
        }
      }
    }
  } catch (error) {
    console.error("[TEMPVOICE] Voice state update error:", error)
  }
})

// Initialize bot
async function main() {
  try {
    console.log("=".repeat(50))
    console.log("RRPBOT - Discord Bot Starting...")
    console.log("=".repeat(50))

    // Load commands
    await loadCommands()

    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN)

  } catch (error) {
    console.error("Failed to start bot:", error)
    process.exit(1)
  }
}

// Handle process events
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error)
})

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error)
  process.exit(1)
})

// Start the bot
main()
