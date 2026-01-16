import { GuildChannel, CategoryChannel, PermissionFlagsBits } from "discord.js"

export async function move_channel_to_category(
  channel: GuildChannel,
  category: CategoryChannel
): Promise<void> {
  try {
    // Move channel to category
    await channel.setParent(category.id, { lockPermissions: false })

    // Sync permissions with category
    await channel.lockPermissions()

    console.log(`[CHANNEL_MANAGER] Moved ${channel.name} to ${category.name}`)
  } catch (error) {
    console.error("[CHANNEL_MANAGER] Error moving channel:", error)
    throw error
  }
}

export async function create_text_channel(
  guild: any,
  name: string,
  category?: CategoryChannel,
  options?: any
): Promise<any> {
  try {
    const channel = await guild.channels.create({
      name,
      type: 0, // Text channel
      parent: category?.id,
      ...options,
    })

    return channel
  } catch (error) {
    console.error("[CHANNEL_MANAGER] Error creating text channel:", error)
    throw error
  }
}

export async function create_voice_channel(
  guild: any,
  name: string,
  category?: CategoryChannel,
  options?: any
): Promise<any> {
  try {
    const channel = await guild.channels.create({
      name,
      type: 2, // Voice channel
      parent: category?.id,
      ...options,
    })

    return channel
  } catch (error) {
    console.error("[CHANNEL_MANAGER] Error creating voice channel:", error)
    throw error
  }
}
