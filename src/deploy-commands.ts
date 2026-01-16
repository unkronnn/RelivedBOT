import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v10"
import { config } from "dotenv"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { readdirSync } from "fs"

config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const commands: any[] = []

// Load all commands
async function loadCommands() {
  const commandFolders = [
    "music",
    "moderation",
    "server",
    "staff",
  ]

  console.log("Loading commands for deployment...")

  for (const folder of commandFolders) {
    const folderPath = join(__dirname, "commands", folder)
    
    try {
      const files = readdirSync(folderPath).filter(file => 
        file.endsWith(".ts") || file.endsWith(".js")
      )

      for (const file of files) {
        const filePath = join(folderPath, file)
        
        try {
          const commandModule = await import(`file://${filePath}`)
          const command = commandModule.command || commandModule.default

          if (command && command.data) {
            commands.push(command.data.toJSON ? command.data.toJSON() : command.data)
            console.log(`✓ Loaded: ${command.data.name}`)
          }
        } catch (error) {
          console.error(`✗ Error loading ${file}:`, error)
        }
      }
    } catch (error) {
      console.log(`Folder ${folder} not found, skipping...`)
    }
  }
}

async function deployCommands() {
  try {
    await loadCommands()

    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!)

    console.log(`\nDeploying ${commands.length} commands...`)

    if (process.env.GUILD_ID) {
      // Deploy to specific guild (faster for testing)
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID),
        { body: commands }
      )
      console.log(`✓ Successfully deployed to guild ${process.env.GUILD_ID}`)
    } else {
      // Deploy globally
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID!),
        { body: commands }
      )
      console.log("✓ Successfully deployed globally")
    }

    console.log("\nCommands deployed successfully!")
  } catch (error) {
    console.error("Error deploying commands:", error)
    process.exit(1)
  }
}

deployCommands()
