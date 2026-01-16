import { GuildMember, PartialGuildMember } from "discord.js"
import * as booster_controller from "../../controllers/booster_controller.js"

export async function handle_boost_update(
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember
): Promise<void> {
  const booster_log_channel_id = process.env.BOOSTER_LOG_CHANNEL_ID
  const booster_media_url = process.env.BOOSTER_MEDIA_URL || ""

  if (!booster_log_channel_id) {
    return // Booster logging not configured
  }

  // Check if boost status changed
  const was_boosting = oldMember.premiumSince !== null
  const is_boosting = newMember.premiumSince !== null

  // User just started boosting
  if (!was_boosting && is_boosting) {
    const guild = newMember.guild
    const boost_count = guild.premiumSubscriptionCount || 0

    try {
      await booster_controller.send_booster_log(
        booster_log_channel_id,
        newMember.id,
        boost_count,
        booster_media_url
      )

      console.log(`[BOOSTER] ${newMember.user.tag} boosted the server (Total: ${boost_count})`)
    } catch (error) {
      console.error("[BOOSTER] Error sending booster log:", error)
    }
  }

  // User stopped boosting
  if (was_boosting && !is_boosting) {
    console.log(`[BOOSTER] ${newMember.user.tag} stopped boosting the server`)
  }
}
