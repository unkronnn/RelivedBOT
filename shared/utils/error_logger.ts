import { Client } from "discord.js"

export async function log_error(
  client: Client,
  error: Error,
  context: string,
  metadata?: Record<string, any>
): Promise<void> {
  const error_message = {
    context,
    message: error.message,
    stack: error.stack,
    metadata,
    timestamp: new Date().toISOString(),
  }

  console.error("[ERROR]", JSON.stringify(error_message, null, 2))

  // You can also send to a log channel if needed
  const log_channel_id = process.env.ERROR_LOG_CHANNEL_ID
  if (log_channel_id) {
    try {
      const channel = await client.channels.fetch(log_channel_id)
      if (channel?.isTextBased() && "send" in channel) {
        await channel.send({
          embeds: [{
            title: `Error: ${context}`,
            description: `\`\`\`\n${error.message}\n\`\`\``,
            color: 0xFF0000,
            timestamp: new Date().toISOString(),
          }],
        })
      }
    } catch (logError) {
      console.error("[ERROR] Failed to send error log:", logError)
    }
  }
}
