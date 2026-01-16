export async function request_loa(options: any): Promise<any> {
  const { user_id, user_tag, end_date, type, reason, guild_id, channel_id } = options

  try {
    const start_date = Math.floor(Date.now() / 1000)
    const end_timestamp = Math.floor(new Date(end_date).getTime() / 1000)

    if (isNaN(end_timestamp)) {
      return {
        success: false,
        error: "Invalid date format. Please use: YYYY-MM-DD",
      }
    }

    const message = {
      embeds: [{
        title: "Leave of Absence Request",
        color: 0xFEE75C,
        fields: [
          { name: "User", value: `<@${user_id}>`, inline: true },
          { name: "Type", value: type, inline: true },
          { name: "Start Date", value: `<t:${start_date}:F>`, inline: false },
          { name: "End Date", value: `<t:${end_timestamp}:F>`, inline: false },
          { name: "Reason", value: reason || "No reason provided", inline: false },
        ],
        timestamp: new Date().toISOString(),
      }],
      components: [{
        type: 1,
        components: [
          {
            type: 2,
            style: 3,
            label: "Approve",
            custom_id: `loa_approve:${user_id}`,
          },
          {
            type: 2,
            style: 4,
            label: "Deny",
            custom_id: `loa_deny:${user_id}`,
          },
        ],
      }],
    }

    return {
      success: true,
      message,
      data: {
        user_id,
        user_tag,
        guild_id,
        channel_id,
        type,
        reason,
        start_date: start_date,
        end_date: end_timestamp,
        status: "pending",
        created_at: Date.now(),
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create LOA request",
    }
  }
}
