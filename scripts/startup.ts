#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Checks if a file exists
 */
function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Runs the download script
 */
async function runDownload(): Promise<void> {
  try {
    console.log('🔄 Running file download script...');
    execSync('tsx scripts/download-file.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Download script completed');
  } catch (error) {
    console.warn('⚠️  Download script failed, continuing with startup...');
    console.warn('Error:', error);
  }
}

/**
 * Starts the Next.js development server
 */
function startDevServer(): void {
  try {
    console.log('🚀 Starting Next.js development server...');
    execSync('npm run dev', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('❌ Failed to start development server:', error);
    process.exit(1);
  }
}

/**
 * Main startup function
 */
async function main() {
  console.log('🎯 MetaVR Dashboard Startup Script');
  console.log('================================');
  
  // Check if downloads directory exists
  const downloadsDir = path.join(process.cwd(), 'downloads');
  const hasDownloads = fileExists(downloadsDir) && fs.readdirSync(downloadsDir).length > 0;
  
  if (!hasDownloads) {
    console.log('📥 No downloaded files found, downloading...');
    await runDownload();
  } else {
    console.log('📁 Downloaded files already exist, skipping download');
  }
  
  // Start the development server
  startDevServer();
}

// Run the startup script
main().catch((error) => {
  console.error('💥 Startup failed:', error);
  process.exit(1);
});
