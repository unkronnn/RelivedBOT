export const component = {
  build_message(options: any) {
    return options
  },

  container(options: any) {
    return {
      type: 17,
      ...options,
    }
  },

  section(options: { content: string | string[]; thumbnail?: string }) {
    const content = Array.isArray(options.content) 
      ? options.content.join("\n") 
      : options.content

    return {
      type: 9,
      components: [
        {
          type: 10,
          content,
        },
      ],
      ...(options.thumbnail && {
        accessory: {
          type: 11,
          media: {
            url: options.thumbnail,
          },
        },
      }),
    }
  },

  text(content: string | string[]) {
    return {
      type: 10,
      content: Array.isArray(content) ? content.join("\n") : content,
    }
  },

  divider(spacing: number = 1) {
    return {
      type: 14,
      spacing,
    }
  },

  action_row(...buttons: any[]) {
    return {
      type: 1,
      components: buttons,
    }
  },

  primary_button(label: string, custom_id: string) {
    return {
      type: 2,
      style: 1,
      label,
      custom_id,
    }
  },

  secondary_button(label: string, custom_id: string) {
    return {
      type: 2,
      style: 2,
      label,
      custom_id,
    }
  },

  success_button(label: string, custom_id: string) {
    return {
      type: 2,
      style: 3,
      label,
      custom_id,
    }
  },

  danger_button(label: string, custom_id: string) {
    return {
      type: 2,
      style: 4,
      label,
      custom_id,
    }
  },

  link_button(label: string, url: string) {
    return {
      type: 2,
      style: 5,
      label,
      url,
    }
  },

  media_gallery(items: any[]) {
    return {
      type: 12,
      items,
    }
  },

  gallery_item(url: string) {
    return {
      media: { url },
    }
  },

  from_hex(hex: string): number {
    return parseInt(hex.replace("#", ""), 16)
  },
}

export const format = {
  bold(text: string): string {
    return `**${text}**`
  },

  italic(text: string): string {
    return `*${text}*`
  },

  code(text: string): string {
    return `\`${text}\``
  },

  code_block(text: string, lang: string = ""): string {
    return `\`\`\`${lang}\n${text}\n\`\`\``
  },

  user_mention(id: string): string {
    return `<@${id}>`
  },

  channel_mention(id: string): string {
    return `<#${id}>`
  },

  role_mention(id: string): string {
    return `<@&${id}>`
  },

  truncate(text: string, max: number): string {
    if (text.length <= max) return text
    return text.slice(0, max - 3) + "..."
  },

  subtext(text: string): string {
    return `-# ${text}`
  },

  logo_url: "https://cdn.discordapp.com/icons/1234567890/logo.png",
}

export const time = {
  relative_time(timestamp: number): string {
    return `<t:${timestamp}:R>`
  },

  format_date(timestamp: number): string {
    return `<t:${timestamp}:F>`
  },

  short_date(timestamp: number): string {
    return `<t:${timestamp}:d>`
  },

  short_time(timestamp: number): string {
    return `<t:${timestamp}:t>`
  },
}

export const array = {
  sort_by<T>(arr: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
    return [...arr].sort((a, b) => {
      if (order === "asc") {
        return a[key] > b[key] ? 1 : -1
      } else {
        return a[key] < b[key] ? 1 : -1
      }
    })
  },

  chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  },
}

export const logger = {
  create_logger(name: string) {
    return {
      info: (...args: any[]) => console.log(`[${name}]`, ...args),
      error: (...args: any[]) => console.error(`[${name}]`, ...args),
      warn: (...args: any[]) => console.warn(`[${name}]`, ...args),
      debug: (...args: any[]) => console.debug(`[${name}]`, ...args),
    }
  },
}

export const api = {
  get_token(): string {
    return process.env.DISCORD_TOKEN || ""
  },

  async get_message(channel_id: string, message_id: string, token: string) {
    try {
      const response = await fetch(
        `https://discord.com/api/v10/channels/${channel_id}/messages/${message_id}`,
        {
          headers: {
            Authorization: `Bot ${token}`,
          },
        }
      )
      return await response.json()
    } catch (error) {
      return { error: "Failed to fetch message" }
    }
  },

  async edit_components_v2(channel_id: string, message_id: string, token: string, message: any) {
    try {
      const response = await fetch(
        `https://discord.com/api/v10/channels/${channel_id}/messages/${message_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        }
      )
      return await response.json()
    } catch (error) {
      return { error: "Failed to edit message" }
    }
  },

  async edit_interaction_response(client_id: string, token: string, message: any) {
    try {
      const response = await fetch(
        `https://discord.com/api/v10/webhooks/${client_id}/${token}/messages/@original`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        }
      )
      return await response.json()
    } catch (error) {
      return { error: "Failed to edit interaction response" }
    }
  },
}

export const modal = {
  create_modal(custom_id: string, title: string, ...components: any[]) {
    return {
      custom_id,
      title,
      components,
    }
  },

  create_text_input(options: {
    custom_id: string
    label: string
    placeholder?: string
    required?: boolean
    max_length?: number
    min_length?: number
    style?: "short" | "paragraph"
  }) {
    return {
      type: 4,
      custom_id: options.custom_id,
      label: options.label,
      style: options.style === "paragraph" ? 2 : 1,
      placeholder: options.placeholder,
      required: options.required ?? true,
      max_length: options.max_length,
      min_length: options.min_length,
    }
  },
}
