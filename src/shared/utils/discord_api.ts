// - Discord API utilities - \\

import { message_payload } from "./components"

export interface api_response {
  error?: string
  data?: any
  id?: string
}

export function get_token(): string {
  return process.env.DISCORD_TOKEN || ""
}

export async function send_components_v2(
  channel_id: string,
  token: string,
  payload: message_payload
): Promise<api_response> {
  try {
    const response = await fetch(`https://discord.com/api/v10/channels/${channel_id}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      return { error: JSON.stringify(error) }
    }

    const data = await response.json()
    return { data, id: data.id }
  } catch (error) {
    return { error: String(error) }
  }
}

export async function edit_components_v2(
  channel_id: string,
  message_id: string,
  token: string,
  payload: message_payload
): Promise<api_response> {
  try {
    const response = await fetch(`https://discord.com/api/v10/channels/${channel_id}/messages/${message_id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      return { error: JSON.stringify(error) }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return { error: String(error) }
  }
}
