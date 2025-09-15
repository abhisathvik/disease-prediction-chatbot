// Generate secure random secrets for environment variables
const crypto = require('crypto')

console.log('=== SECURE ENVIRONMENT VARIABLES ===')
console.log('')
console.log('NEXTAUTH_SECRET=' + crypto.randomBytes(32).toString('hex'))
console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('hex'))
console.log('')
console.log('Copy these values to your Vercel environment variables.')