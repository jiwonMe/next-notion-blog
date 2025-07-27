#!/usr/bin/env node

/**
 * Test script to check if the dev server starts without font-related errors
 */

const { spawn } = require('child_process')
const { setTimeout } = require('timers/promises')

async function testDevServer() {
  console.log('🚀 Starting Next.js dev server test...')
  
  // Start the dev server
  const devProcess = spawn('pnpm', ['dev'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'development' }
  })

  let hasErrors = false
  let isReady = false
  const errors = []

  // Monitor stdout
  devProcess.stdout.on('data', (data) => {
    const output = data.toString()
    console.log('📤', output.trim())
    
    if (output.includes('Ready in')) {
      isReady = true
    }
  })

  // Monitor stderr for font-related errors
  devProcess.stderr.on('data', (data) => {
    const error = data.toString()
    console.error('❌', error.trim())
    
    if (error.includes('font') || error.includes('JSON.parse') || error.includes('next-font-loader')) {
      hasErrors = true
      errors.push(error.trim())
    }
  })

  // Wait for server to start
  await setTimeout(15000)

  // Test a simple HTTP request
  try {
    const response = await fetch('http://localhost:3000')
    if (response.ok) {
      console.log('✅ HTTP request successful')
    } else {
      console.log('⚠️ HTTP request failed with status:', response.status)
    }
  } catch (error) {
    console.log('❌ HTTP request failed:', error.message)
  }

  // Kill the dev process
  devProcess.kill('SIGTERM')

  // Report results
  console.log('\n📊 Test Results:')
  console.log(`Server ready: ${isReady ? '✅' : '❌'}`)
  console.log(`Font errors: ${hasErrors ? '❌' : '✅'}`)
  
  if (errors.length > 0) {
    console.log('\n🐛 Font-related errors found:')
    errors.forEach(error => console.log(`  - ${error}`))
  } else {
    console.log('\n🎉 No font-related errors detected!')
  }

  process.exit(hasErrors ? 1 : 0)
}

testDevServer().catch(console.error)