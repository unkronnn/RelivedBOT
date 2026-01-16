import { ButtonInteraction } from "discord.js"
import * as booster_controller from "../../controllers/booster_controller.js"

export async function handle(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true })

  const user_id = interaction.customId.split("_")[2]

  // Verify the user clicking is the one mentioned
  if (interaction.user.id !== user_id) {
    await interaction.editReply({
      content: "This button is not for you!",
    })
    return
  }

  const guild_id = interaction.guildId!

  try {
    const result = await booster_controller.handle_claim(user_id, guild_id)

    await interaction.editReply({
      content: result,
    })

    console.log(`[BOOSTER] ${interaction.user.tag} claimed whitelist in ${guild_id}`)
  } catch (error) {
    console.error("[BOOSTER] Error handling claim:", error)
    await interaction.editReply({
      content: "An error occurred while processing your claim. Please contact an administrator.",
    })
  }
}
