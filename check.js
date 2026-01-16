// Simple startup check script
const fs = require('fs')
const path = require('path')

console.log('\n🔍 RRPBOT Startup Checklist\n')

const checks = [
  {
    name: 'package.json',
    check: () => fs.existsSync('package.json'),
    fix: 'File exists'
  },
  {
    name: '.env file',
    check: () => fs.existsSync('.env'),
    fix: 'Run: npm run setup OR copy .env.example to .env'
  },
  {
    name: 'node_modules',
    check: () => fs.existsSync('node_modules'),
    fix: 'Run: npm install'
  },
  {
    name: 'src/index.ts',
    check: () => fs.existsSync('src/index.ts'),
    fix: 'Main bot file missing'
  },
  {
    name: 'DISCORD_TOKEN in .env',
    check: () => {
      if (!fs.existsSync('.env')) return false
      const env = fs.readFileSync('.env', 'utf8')
      return env.includes('DISCORD_TOKEN=') && !env.includes('DISCORD_TOKEN=your_bot_token_here')
    },
    fix: 'Set your Discord bot token in .env file'
  },
  {
    name: 'CLIENT_ID in .env',
    check: () => {
      if (!fs.existsSync('.env')) return false
      const env = fs.readFileSync('.env', 'utf8')
      return env.includes('CLIENT_ID=') && !env.includes('CLIENT_ID=your_client_id_here')
    },
    fix: 'Set your Discord client ID in .env file'
  },
]

let allPassed = true

checks.forEach(({ name, check, fix }) => {
  const passed = check()
  const icon = passed ? '✅' : '❌'
  console.log(`${icon} ${name}`)
  
  if (!passed) {
    console.log(`   → ${fix}\n`)
    allPassed = false
  }
})

console.log('\n' + '='.repeat(50))

if (allPassed) {
  console.log('✅ All checks passed! You can start the bot with:')
  console.log('   npm run dev\n')
} else {
  console.log('❌ Some checks failed. Please fix them first.\n')
  console.log('Quick setup: npm run setup\n')
}

// Check MongoDB connection (optional)
console.log('Optional checks:')
console.log('⚠️  MongoDB - Make sure MongoDB is running')
console.log('   Test: mongosh (or mongo)')
console.log('⚠️  Commands deployed - Run: npm run deploy')
console.log('   (Required before bot can respond to slash commands)\n')
