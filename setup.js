#!/usr/bin/env node

/**
 * Quick Start Script for RRPBOT
 * 
 * This script helps you setup the bot quickly
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  console.log('\n='.repeat(50))
  console.log('RRPBOT Quick Setup')
  console.log('='.repeat(50))
  console.log('\nThis script will help you create a .env file\n')

  // Check if .env already exists
  if (fs.existsSync('.env')) {
    const overwrite = await question('.env file already exists. Overwrite? (y/n): ')
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.')
      rl.close()
      return
    }
  }

  // Get user input
  console.log('\nPlease provide the following information:')
  console.log('(You can find these in Discord Developer Portal)\n')

  const token = await question('Discord Bot Token: ')
  const clientId = await question('Client ID (Application ID): ')
  const guildId = await question('Guild ID (for testing, optional): ')
  
  console.log('\nDatabase Configuration:')
  const mongoUri = await question('MongoDB URI [mongodb://localhost:27017/rrpbot]: ') 
    || 'mongodb://localhost:27017/rrpbot'
  const dbName = await question('Database Name [rrpbot]: ') || 'rrpbot'

  // Create .env content
  const envContent = `# Discord Bot Configuration
DISCORD_TOKEN=${token}
CLIENT_ID=${clientId}
${guildId ? `GUILD_ID=${guildId}` : '# GUILD_ID=your_guild_id_here'}

# Database Configuration
MONGODB_URI=${mongoUri}
DATABASE_NAME=${dbName}

# Bot Settings
PREFIX=!
LOG_CHANNEL_ID=your_log_channel_id
SUPPORT_ROLE_ID=your_support_role_id

# Music Configuration
MUSIC_MAX_QUEUE_SIZE=100
MUSIC_DEFAULT_VOLUME=50

# Moderation Settings
AUTO_MOD_ENABLED=true
SPAM_DETECTION_ENABLED=true

# Environment
NODE_ENV=development
`

  // Write .env file
  fs.writeFileSync('.env', envContent)
  
  console.log('\n✅ .env file created successfully!')
  console.log('\nNext steps:')
  console.log('1. Install dependencies: npm install')
  console.log('2. Deploy commands: npm run deploy')
  console.log('3. Start the bot: npm run dev')
  console.log('\nFor more information, check README.md')
  
  rl.close()
}

main().catch(console.error)
