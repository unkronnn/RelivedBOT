import {
  VoiceChannel,
  GuildMember,
  Guild,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js"

// Temporary storage (in production, use database)
const temp_channels = new Map<string, { owner_id: string; created_at: number }>()
const channel_settings = new Map<string, any>()
let generator_channel_id: string | null = null
let category_id: string | null = null

interface SetupResult {
  success: boolean
  error?: string
  category_name?: string
  generator_name?: string
  interface_channel_id?: string
}

export function is_temp_channel(channel_id: string): boolean {
  return temp_channels.has(channel_id)
}

export function is_channel_owner(channel_id: string, user_id: string): boolean {
  const channel = temp_channels.get(channel_id)
  return channel?.owner_id === user_id
}

export function get_generator_channel_id(): string | null {
  return generator_channel_id
}

export function set_generator_channel(channel_id: string): void {
  generator_channel_id = channel_id
  console.log(`[TEMPVOICE] Generator channel set to: ${channel_id}`)
}

export async function auto_detect_generator(guild: Guild): Promise<void> {
  try {
    // Find "Temp Voice" category
    const category = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === "Temp Voice"
    )

    if (!category) {
      console.log("[TEMPVOICE] No Temp Voice category found")
      return
    }

    // Find "➕ Create Voice" channel
    const generator = guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildVoice &&
        c.parentId === category.id &&
        c.name === "➕ Create Voice"
    )

    if (generator) {
      generator_channel_id = generator.id
      category_id = category.id
      console.log(`[TEMPVOICE] Auto-detected generator channel: ${generator.id}`)
    } else {
      console.log("[TEMPVOICE] No generator channel found in category")
    }
  } catch (error) {
    console.error("[TEMPVOICE] Failed to auto-detect generator:", error)
  }
}

export async function rename_tempvoice_channel(
  channel: VoiceChannel,
  new_name: string
): Promise<boolean> {
  try {
    await channel.setName(new_name)
    return true
  } catch (error) {
    console.error("[TEMPVOICE] Rename error:", error)
    return false
  }
}

export async function set_user_limit(
  channel: VoiceChannel,
  limit: number
): Promise<boolean> {
  try {
    await channel.setUserLimit(limit)
    return true
  } catch (error) {
    console.error("[TEMPVOICE] Set limit error:", error)
    return false
  }
}

export async function invite_user(
  channel: VoiceChannel,
  user_id: string
): Promise<boolean> {
  try {
    await channel.permissionOverwrites.edit(user_id, {
      Connect: true,
      ViewChannel: true,
    })
    return true
  } catch (error) {
    console.error("[TEMPVOICE] Invite error:", error)
    return false
  }
}

export async function trust_user(
  channel: VoiceChannel,
  user_id: string
): Promise<boolean> {
  try {
    await channel.permissionOverwrites.edit(user_id, {
      Connect: true,
      Speak: true,
      Stream: true,
    })
    return true
  } catch (error) {
    console.error("[TEMPVOICE] Trust error:", error)
    return false
  }
}

export async function untrust_user(
  channel: VoiceChannel,
  user_id: string
): Promise<boolean> {
  try {
    await channel.permissionOverwrites.delete(user_id)
    return true
  } catch (error) {
    console.error("[TEMPVOICE] Untrust error:", error)
    return false
  }
}

export async function kick_user(
  channel: VoiceChannel,
  user_id: string
): Promise<boolean> {
  try {
    const member = channel.members.get(user_id)
    if (member) {
      await member.voice.disconnect()
      return true
    }
    return false
  } catch (error) {
    console.error("[TEMPVOICE] Kick error:", error)
    return false
  }
}

export async function block_user(
  channel: VoiceChannel,
  user_id: string
): Promise<boolean> {
  try {
    await channel.permissionOverwrites.edit(user_id, {
      Connect: false,
      ViewChannel: false,
    })
    
    // Kick if in channel
    const member = channel.members.get(user_id)
    if (member) {
      await member.voice.disconnect()
    }
    
    return true
  } catch (error) {
    console.error("[TEMPVOICE] Block error:", error)
    return false
  }
}

export async function unblock_user(
  channel: VoiceChannel,
  user_id: string
): Promise<boolean> {
  try {
    await channel.permissionOverwrites.delete(user_id)
    return true
  } catch (error) {
    console.error("[TEMPVOICE] Unblock error:", error)
    return false
  }
}

export async function set_region(
  channel: VoiceChannel,
  region: string | null
): Promise<boolean> {
  try {
    await channel.setRTCRegion(region)
    return true
  } catch (error) {
    console.error("[TEMPVOICE] Set region error:", error)
    return false
  }
}

export async function transfer_ownership(
  channel: VoiceChannel,
  old_owner: GuildMember,
  new_owner_id: string
): Promise<boolean> {
  try {
    const channel_data = temp_channels.get(channel.id)
    if (channel_data) {
      channel_data.owner_id = new_owner_id
      temp_channels.set(channel.id, channel_data)
    }
    return true
  } catch (error) {
    console.error("[TEMPVOICE] Transfer error:", error)
    return false
  }
}

export function register_temp_channel(
  channel_id: string,
  owner_id: string
): void {
  temp_channels.set(channel_id, {
    owner_id,
    created_at: Date.now(),
  })
}

export function unregister_temp_channel(channel_id: string): void {
  temp_channels.delete(channel_id)
  channel_settings.delete(channel_id)
}

export async function setup_tempvoice(guild: Guild): Promise<SetupResult> {
  try {
    const category_name = "Temp Voice"
    const generator_name = "➕ Create Voice"

    // Find or create category
    let category = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === category_name
    )

    if (!category) {
      category = await guild.channels.create({
        name: category_name,
        type: ChannelType.GuildCategory,
      })
      console.log(`[TEMPVOICE] Created category: ${category.name}`)
    }

    category_id = category.id

    // Find or create interface channel
    let interface_channel = guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildText &&
        c.parentId === category!.id &&
        c.name === "🔊・voice-interface"
    )

    if (!interface_channel) {
      interface_channel = await guild.channels.create({
        name: "🔊・voice-interface",
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.SendMessages],
          },
        ],
      })
      console.log(`[TEMPVOICE] Created interface channel: ${interface_channel.name}`)
    }

    // Find or create generator channel
    let generator = guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildVoice &&
        c.parentId === category!.id &&
        c.name === generator_name
    )

    if (!generator) {
      generator = await guild.channels.create({
        name: generator_name,
        type: ChannelType.GuildVoice,
        parent: category.id,
        bitrate: 96000,
      })
      console.log(`[TEMPVOICE] Created generator channel: ${generator.name}`)
    }

    generator_channel_id = generator.id
    
    console.log(`[TEMPVOICE] Setup complete - Generator ID: ${generator_channel_id}`)

    return {
      success: true,
      category_name: category.name,
      generator_name: generator.name,
      interface_channel_id: interface_channel.id,
    }
  } catch (error) {
    console.error("[TEMPVOICE] Failed to setup TempVoice:", error)
    return {
      success: false,
      error: String(error),
    }
  }
}
