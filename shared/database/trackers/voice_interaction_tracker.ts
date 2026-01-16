import { db } from "../../utils/database.js"

interface VoiceInteraction {
  owner_id: string
  target_id: string
  guild_id: string
  action: string
  timestamp: number
}

export async function track_interaction(
  owner_id: string,
  target_id: string,
  guild_id: string,
  action: string
): Promise<void> {
  try {
    const interaction: VoiceInteraction = {
      owner_id,
      target_id,
      guild_id,
      action,
      timestamp: Date.now(),
    }

    await db.insert_one("voice_interactions", interaction)
    console.log(`[VOICE_TRACKER] Tracked ${action}: ${owner_id} -> ${target_id}`)
  } catch (error) {
    console.error("[VOICE_TRACKER] Error tracking interaction:", error)
  }
}

export async function get_user_interactions(
  user_id: string,
  guild_id: string
): Promise<VoiceInteraction[]> {
  try {
    return await db.find_many("voice_interactions", {
      $or: [{ owner_id: user_id }, { target_id: user_id }],
      guild_id,
    })
  } catch (error) {
    console.error("[VOICE_TRACKER] Error getting interactions:", error)
    return []
  }
}
