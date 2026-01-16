import {
  ButtonInteraction,
  GuildMember,
  VoiceChannel,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js"
import * as tempvoice from "../../../shared/database/services/tempvoice"
import * as component from "../../shared/utils/components"

function create_not_in_channel_reply(guild_id: string, generator_channel_id: string | null) {
  return component.build_message({
    components: [
      component.container({
        components: [
          component.text("You must be in your temporary voice channel to use this."),
          ...(generator_channel_id
            ? [
                component.divider(1),
                component.action_row(
                  component.link_button(
                    "Join Voice",
                    `https://discord.com/channels/${guild_id}/${generator_channel_id}`
                  )
                ),
              ]
            : []),
        ],
      }),
    ],
  })
}

function create_not_owner_reply(message: string) {
  return component.build_message({
    components: [
      component.container({
        components: [component.text(message)],
      }),
    ],
  })
}

function create_success_reply(message: string) {
  return component.build_message({
    components: [
      component.container({
        components: [component.text(message)],
      }),
    ],
  })
}

function create_error_reply(message: string) {
  return component.build_message({
    components: [
      component.container({
        components: [component.text(message)],
      }),
    ],
  })
}

async function handle_tempvoice_name(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can rename the channel."),
      ephemeral: true,
    })
    return
  }

  const modal = new ModalBuilder()
    .setCustomId("tempvoice_name_modal")
    .setTitle("Rename Channel")

  const name_input = new TextInputBuilder()
    .setCustomId("channel_name")
    .setLabel("New Channel Name")
    .setPlaceholder("Enter new channel name...")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)
    .setValue(channel.name)

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(name_input)
  modal.addComponents(row)

  await interaction.showModal(modal)
}

async function handle_tempvoice_limit(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can set the user limit."),
      ephemeral: true,
    })
    return
  }

  const modal = new ModalBuilder()
    .setCustomId("tempvoice_limit_modal")
    .setTitle("Set User Limit")

  const limit_input = new TextInputBuilder()
    .setCustomId("user_limit")
    .setLabel("User Limit (0 for unlimited)")
    .setPlaceholder("Enter a number (0-99)...")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(2)
    .setValue(String(channel.userLimit))

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(limit_input)
  modal.addComponents(row)

  await interaction.showModal(modal)
}

async function handle_tempvoice_privacy(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can change privacy settings."),
      ephemeral: true,
    })
    return
  }

  await interaction.deferReply({ ephemeral: true })

  const everyone_perms = channel.permissionOverwrites.cache.get(
    channel.guild.roles.everyone.id
  )
  const is_private = everyone_perms?.deny.has("Connect") || false

  try {
    if (!is_private) {
      // Make private
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone.id, {
        Connect: false,
      })
      await interaction.editReply(
        create_success_reply(
          "Channel is now **private**. Only trusted users can join."
        )
      )
    } else {
      // Make public
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone.id, {
        Connect: true,
      })
      await interaction.editReply(
        create_success_reply("Channel is now **public**. Everyone can join.")
      )
    }
  } catch (error) {
    console.error("[TEMPVOICE] Privacy error:", error)
    await interaction.editReply(create_error_reply("Failed to change privacy settings."))
  }
}

async function handle_tempvoice_trust(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can trust users."),
      ephemeral: true,
    })
    return
  }

  const reply = component.build_message({
    components: [
      component.container({
        components: [
          component.text("Select a user to trust:"),
          component.user_select("tempvoice_trust_select", "Select user to trust"),
        ],
      }),
    ],
  })

  await interaction.reply({ ...reply, ephemeral: true })
}

async function handle_tempvoice_untrust(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can untrust users."),
      ephemeral: true,
    })
    return
  }

  const reply = component.build_message({
    components: [
      component.container({
        components: [
          component.text("Select a user to untrust:"),
          component.user_select("tempvoice_untrust_select", "Select user to untrust"),
        ],
      }),
    ],
  })

  await interaction.reply({ ...reply, ephemeral: true })
}

async function handle_tempvoice_invite(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can invite users."),
      ephemeral: true,
    })
    return
  }

  const reply = component.build_message({
    components: [
      component.container({
        components: [
          component.text("Select a user to invite:"),
          component.user_select("tempvoice_invite_select", "Select user to invite"),
        ],
      }),
    ],
  })

  await interaction.reply({ ...reply, ephemeral: true })
}

async function handle_tempvoice_kick(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can kick users."),
      ephemeral: true,
    })
    return
  }

  const reply = component.build_message({
    components: [
      component.container({
        components: [
          component.text("Select a user to kick:"),
          component.user_select("tempvoice_kick_select", "Select user to kick"),
        ],
      }),
    ],
  })

  await interaction.reply({ ...reply, ephemeral: true })
}

async function handle_tempvoice_block(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can block users."),
      ephemeral: true,
    })
    return
  }

  const reply = component.build_message({
    components: [
      component.container({
        components: [
          component.text("Select a user to block:"),
          component.user_select("tempvoice_block_select", "Select user to block"),
        ],
      }),
    ],
  })

  await interaction.reply({ ...reply, ephemeral: true })
}

async function handle_tempvoice_unblock(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can unblock users."),
      ephemeral: true,
    })
    return
  }

  const reply = component.build_message({
    components: [
      component.container({
        components: [
          component.text("Select a user to unblock:"),
          component.user_select("tempvoice_unblock_select", "Select user to unblock"),
        ],
      }),
    ],
  })

  await interaction.reply({ ...reply, ephemeral: true })
}

async function handle_tempvoice_delete(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can delete the channel."),
      ephemeral: true,
    })
    return
  }

  await interaction.deferReply({ ephemeral: true })

  try {
    await channel.delete()
    tempvoice.unregister_temp_channel(channel.id)
    // Can't reply after deleting channel
  } catch (error) {
    console.error("[TEMPVOICE] Delete error:", error)
    await interaction.editReply(create_error_reply("Failed to delete channel."))
  }
}

async function handle_tempvoice_region(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can change the region."),
      ephemeral: true,
    })
    return
  }

  // Show region select menu (handled by region_select.ts)
  const reply = component.build_message({
    components: [
      component.container({
        components: [
          component.text("Select a region:"),
          component.string_select("tempvoice_region_select", "Select region", [
            { label: "Automatic", value: "auto", description: "Let Discord choose the best region" },
            { label: "Singapore", value: "singapore", description: "Southeast Asia" },
            { label: "Sydney", value: "sydney", description: "Australia" },
            { label: "Japan", value: "japan", description: "East Asia" },
            { label: "Hong Kong", value: "hongkong", description: "East Asia" },
            { label: "US East", value: "us-east", description: "North America" },
            { label: "US West", value: "us-west", description: "North America" },
            { label: "Europe", value: "europe", description: "Europe" },
          ]),
        ],
      }),
    ],
  })

  await interaction.reply({ ...reply, ephemeral: true })
}

async function handle_tempvoice_claim(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  await interaction.deferReply({ ephemeral: true })

  // Check if current owner is in channel
  const owner_id = tempvoice.is_channel_owner(channel.id, member.id)
  const current_owner = channel.members.find((m) => tempvoice.is_channel_owner(channel.id, m.id))

  if (current_owner) {
    await interaction.editReply(
      create_error_reply(`The channel owner <@${current_owner.id}> is still in the channel.`)
    )
    return
  }

  // Transfer ownership to claimer
  const success = await tempvoice.transfer_ownership(channel, member, member.id)
  if (success) {
    await interaction.editReply(
      create_success_reply("You are now the owner of this channel.")
    )
  } else {
    await interaction.editReply(create_error_reply("Failed to claim channel."))
  }
}

async function handle_tempvoice_transfer(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can transfer ownership."),
      ephemeral: true,
    })
    return
  }

  const reply = component.build_message({
    components: [
      component.container({
        components: [
          component.text("Select a user to transfer ownership to:"),
          component.user_select("tempvoice_transfer_select", "Select new owner"),
        ],
      }),
    ],
  })

  await interaction.reply({ ...reply, ephemeral: true })
}

async function handle_tempvoice_waitingroom(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can toggle waiting room."),
      ephemeral: true,
    })
    return
  }

  await interaction.reply({
    ...create_error_reply("Waiting room feature is not yet implemented."),
    ephemeral: true,
  })
}

async function handle_tempvoice_chat(interaction: ButtonInteraction): Promise<void> {
  const member = interaction.member as GuildMember
  const channel = member.voice.channel as VoiceChannel
  const guild_id = interaction.guildId!

  if (!channel || !tempvoice.is_temp_channel(channel.id)) {
    await interaction.reply({
      ...create_not_in_channel_reply(guild_id, tempvoice.get_generator_channel_id()),
      ephemeral: true,
    })
    return
  }

  if (!tempvoice.is_channel_owner(channel.id, member.id)) {
    await interaction.reply({
      ...create_not_owner_reply("Only the channel owner can create a chat thread."),
      ephemeral: true,
    })
    return
  }

  await interaction.reply({
    ...create_error_reply("Chat thread feature is not yet implemented."),
    ephemeral: true,
  })
}

export async function handle_tempvoice_buttons(
  interaction: ButtonInteraction
): Promise<boolean> {
  const handler_map: Record<string, (interaction: ButtonInteraction) => Promise<void>> = {
    tempvoice_name: handle_tempvoice_name,
    tempvoice_limit: handle_tempvoice_limit,
    tempvoice_privacy: handle_tempvoice_privacy,
    tempvoice_waitingroom: handle_tempvoice_waitingroom,
    tempvoice_chat: handle_tempvoice_chat,
    tempvoice_trust: handle_tempvoice_trust,
    tempvoice_untrust: handle_tempvoice_untrust,
    tempvoice_invite: handle_tempvoice_invite,
    tempvoice_kick: handle_tempvoice_kick,
    tempvoice_region: handle_tempvoice_region,
    tempvoice_block: handle_tempvoice_block,
    tempvoice_unblock: handle_tempvoice_unblock,
    tempvoice_claim: handle_tempvoice_claim,
    tempvoice_transfer: handle_tempvoice_transfer,
    tempvoice_delete: handle_tempvoice_delete,
  }

  const handler = handler_map[interaction.customId]
  if (handler) {
    await handler(interaction)
    return true
  }

  return false
}
