#!/usr/bin/env tsx

// GameOn Data Seeder - Production-grade synthetic data generator
// Usage: pnpm tsx scripts/seed.ts [options]

import { program } from 'commander'
import fs from 'fs/promises'
import path from 'path'
import { createWriteStream } from 'fs'
import { 
  SCALE_PRESETS, 
  DEFAULT_GENERATION_PARAMS, 
  DEFAULT_OUTPUT_CONFIG,
  SeedScale,
  GenerationParams,
  OutputConfig 
} from './seed.config'
import { UserGenerator } from './gen/users'
import { EventGenerator } from './gen/events'
import { validateEventData, validateMembershipData } from '../src/lib/status'

interface SeedOptions {
  scale: string
  format: 'json' | 'jsonl' | 'firestore' | 'supabase'
  output: string
  seed: number
  stream: boolean
  chunk: number
  validate: boolean
  verbose: boolean
}

// CLI Configuration
program
  .name('seed')
  .description('Generate synthetic data for GameOn')
  .version('1.0.0')
  .option('--scale <scale>', 'Scale preset (small|medium|large|xl)', 'small')
  .option('--format <format>', 'Output format (json|jsonl|firestore|supabase)', 'json')
  .option('--output <dir>', 'Output directory', './data/generated')
  .option('--seed <number>', 'Random seed for reproducibility', '42')
  .option('--stream', 'Stream output to JSONL files (memory efficient)', false)
  .option('--chunk <size>', 'Chunk size for database writes', '1000')
  .option('--validate', 'Validate generated data against business rules', true)
  .option('--verbose', 'Verbose logging', false)

// Main seeder class
class GameOnSeeder {
  private options: SeedOptions
  private scale: SeedScale
  private params: GenerationParams
  private outputConfig: OutputConfig
  private seed: number

  constructor(options: SeedOptions) {
    this.options = options
    this.seed = parseInt(options.seed)
    
    // Get scale configuration
    if (!SCALE_PRESETS[options.scale]) {
      throw new Error(`Unknown scale: ${options.scale}. Available: ${Object.keys(SCALE_PRESETS).join(', ')}`)
    }
    this.scale = SCALE_PRESETS[options.scale]
    
    // Use default generation parameters
    this.params = DEFAULT_GENERATION_PARAMS
    
    // Configure output
    this.outputConfig = {
      ...DEFAULT_OUTPUT_CONFIG,
      format: options.format as any,
      outputDir: options.output,
      chunkSize: parseInt(options.chunk)
    }
    
    this.log(`🎯 GameOn Data Seeder v1.0.0`)
    this.log(`📊 Scale: ${this.scale.name} (${this.scale.users} users, ${this.scale.events} events)`)
    this.log(`🎲 Seed: ${this.seed} (reproducible)`)
    this.log(`📁 Output: ${this.outputConfig.outputDir} (${this.outputConfig.format})`)
  }

  // Main generation method
  async generate(): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Ensure output directory exists
      await this.ensureOutputDirectory()
      
      // Generate users and social connections
      this.log('\n👥 Generating Users & Social Network...')
      const userGenerator = new UserGenerator(this.seed, this.scale, this.params)
      const users = userGenerator.generateUsers()
      const connections = userGenerator.generateSocialConnections(users)
      
      // Generate events and memberships
      this.log('\n🎮 Generating Events & Memberships...')
      const eventGenerator = new EventGenerator(this.seed, this.scale, this.params, users)
      const { events, memberships, invites, requests } = eventGenerator.generateEventsAndMemberships()
      
      // Validate data if requested
      if (this.options.validate) {
        this.log('\n✅ Validating Generated Data...')
        await this.validateData(events, memberships)
      }
      
      // Output data
      this.log('\n💾 Writing Output Files...')
      await this.writeOutput({
        users,
        connections,
        events,
        memberships,
        invites,
        requests
      })
      
      // Generate summary
      const duration = (Date.now() - startTime) / 1000
      this.generateSummary({
        users: users.length,
        connections: connections.length,
        events: events.length,
        memberships: memberships.length,
        invites: invites.length,
        requests: requests.length,
        duration
      })
      
    } catch (error) {
      console.error('❌ Seeder failed:', error)
      process.exit(1)
    }
  }

  // Ensure output directory exists
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.access(this.outputConfig.outputDir)
    } catch {
      await fs.mkdir(this.outputConfig.outputDir, { recursive: true })
      this.log(`📁 Created output directory: ${this.outputConfig.outputDir}`)
    }
  }

  // Validate generated data
  private async validateData(events: any[], memberships: any[]): Promise<void> {
    let eventErrors = 0
    let membershipErrors = 0
    
    // Validate events
    for (const event of events) {
      const validation = validateEventData(event)
      if (!validation.isValid) {
        eventErrors++
        if (this.options.verbose) {
          console.log(`Event ${event.id} validation errors:`, validation.errors)
        }
      }
    }
    
    // Validate memberships
    for (const membership of memberships) {
      const validation = validateMembershipData(membership)
      if (!validation.isValid) {
        membershipErrors++
        if (this.options.verbose) {
          console.log(`Membership ${membership.userId}/${membership.eventId} validation errors:`, validation.errors)
        }
      }
    }
    
    if (eventErrors > 0 || membershipErrors > 0) {
      throw new Error(`Validation failed: ${eventErrors} event errors, ${membershipErrors} membership errors`)
    }
    
    this.log(`✅ Validation passed: ${events.length} events, ${memberships.length} memberships`)
  }

  // Write output in specified format
  private async writeOutput(data: any): Promise<void> {
    switch (this.outputConfig.format) {
      case 'json':
        await this.writeJSON(data)
        break
      case 'jsonl':
        await this.writeJSONL(data)
        break
      case 'firestore':
        await this.writeFirestore(data)
        break
      case 'supabase':
        await this.writeSupabase(data)
        break
      default:
        throw new Error(`Unsupported output format: ${this.outputConfig.format}`)
    }
  }

  // Write JSON files
  private async writeJSON(data: any): Promise<void> {
    const collections = ['users', 'connections', 'events', 'memberships', 'invites', 'requests']
    
    for (const collection of collections) {
      const filepath = path.join(this.outputConfig.outputDir, `${collection}.json`)
      const content = JSON.stringify(data[collection], null, 2)
      await fs.writeFile(filepath, content, 'utf8')
      this.log(`📄 ${collection}.json (${data[collection].length} items, ${this.formatBytes(content.length)})`)
    }
  }

  // Write JSONL files (streaming for memory efficiency)
  private async writeJSONL(data: any): Promise<void> {
    const collections = ['users', 'connections', 'events', 'memberships', 'invites', 'requests']
    
    for (const collection of collections) {
      const filepath = path.join(this.outputConfig.outputDir, `${collection}.jsonl`)
      const writeStream = createWriteStream(filepath, { encoding: 'utf8' })
      
      let count = 0
      for (const item of data[collection]) {
        writeStream.write(JSON.stringify(item) + '\n')
        count++
        
        if (count % 1000 === 0) {
          this.log(`  Writing ${collection}: ${count}/${data[collection].length}`)
        }
      }
      
      writeStream.end()
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve)
        writeStream.on('error', reject)
      })
      
      this.log(`📄 ${collection}.jsonl (${data[collection].length} items)`)
    }
  }

  // Write to Firestore (batched)
  private async writeFirestore(data: any): Promise<void> {
    this.log('🔥 Firestore output not yet implemented')
    this.log('💡 For now, use JSON output and import manually')
    await this.writeJSON(data)
  }

  // Write to Supabase (batched)
  private async writeSupabase(data: any): Promise<void> {
    this.log('🐘 Supabase output not yet implemented')
    this.log('💡 For now, use JSON output and import manually')
    await this.writeJSON(data)
  }

  // Generate summary report
  private generateSummary(stats: any): void {
    this.log('\n📊 Generation Summary:')
    this.log('=' .repeat(50))
    this.log(`👥 Users: ${stats.users.toLocaleString()}`)
    this.log(`🤝 Connections: ${stats.connections.toLocaleString()}`)
    this.log(`🎮 Events: ${stats.events.toLocaleString()}`)
    this.log(`📝 Memberships: ${stats.memberships.toLocaleString()}`)
    this.log(`📧 Invites: ${stats.invites.toLocaleString()}`)
    this.log(`📋 Requests: ${stats.requests.toLocaleString()}`)
    this.log('=' .repeat(50))
    this.log(`⏱️  Generation time: ${stats.duration.toFixed(2)}s`)
    this.log(`🎲 Seed used: ${this.seed}`)
    this.log(`📁 Output directory: ${this.outputConfig.outputDir}`)
    
    // Calculate statistics
    const avgFriendsPerUser = stats.connections * 2 / stats.users
    const avgMembershipsPerEvent = stats.memberships / stats.events
    const avgEventsPerUser = stats.events / stats.users
    
    this.log('\n📈 Data Quality Metrics:')
    this.log(`📊 Avg friends per user: ${avgFriendsPerUser.toFixed(1)}`)
    this.log(`📊 Avg memberships per event: ${avgMembershipsPerEvent.toFixed(1)}`)
    this.log(`📊 Avg events per user: ${avgEventsPerUser.toFixed(1)}`)
    
    // Distribution insights
    const superHostCount = Math.floor(stats.users * this.scale.superHostPercent)
    const regularHostCount = stats.users - superHostCount
    
    this.log('\n🏆 Host Distribution:')
    this.log(`👑 Super-hosts: ${superHostCount} (${(this.scale.superHostPercent * 100).toFixed(1)}%)`)
    this.log(`👤 Regular hosts: ${regularHostCount} (${((1 - this.scale.superHostPercent) * 100).toFixed(1)}%)`)
    
    this.log('\n✅ Generation completed successfully!')
    this.log(`\n💡 To regenerate identical data, use: --seed ${this.seed}`)
  }

  // Utility: Format bytes for human reading
  private formatBytes(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + sizes[i]
  }

  // Utility: Logging with timestamp
  private log(message: string): void {
    if (this.options.verbose || !message.startsWith('  ')) {
      const timestamp = new Date().toLocaleTimeString()
      console.log(`[${timestamp}] ${message}`)
    }
  }
}

// CLI Handler
async function main() {
  program.parse()
  const options = program.opts() as SeedOptions
  
  // Override seed from environment if provided
  if (process.env.SEED) {
    options.seed = parseInt(process.env.SEED)
  }
  
  // Enable streaming for large scales
  if (options.scale === 'large' || options.scale === 'xl') {
    options.stream = true
    options.format = 'jsonl'
  }
  
  const seeder = new GameOnSeeder(options)
  await seeder.generate()
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error)
  process.exit(1)
})

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { GameOnSeeder }
