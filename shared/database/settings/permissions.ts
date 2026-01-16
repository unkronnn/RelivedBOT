import { GuildMember, PermissionFlagsBits } from "discord.js"

export function is_admin(member: GuildMember): boolean {
  return member.permissions.has(PermissionFlagsBits.Administrator)
}

export function is_moderator(member: GuildMember): boolean {
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
    member.permissions.has(PermissionFlagsBits.KickMembers) ||
    member.permissions.has(PermissionFlagsBits.BanMembers)
  )
}

export function has_permission(member: GuildMember, permission: bigint): boolean {
  return member.permissions.has(permission)
}
