import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../src/config/env';

/**
 * Sui Move Deployment Script for AlphaAgent
 * Compiles the Move contract in contracts/ and publishes to Sui Testnet
 */
async function deployContract() {
  console.log('🚀 [AlphaAgent] Starting Sui Move Deployment to Testnet...');
  const contractsDir = path.resolve(__dirname, '../contracts');
  const envFilePath = path.resolve(__dirname, '../.env.local');

  // 1. Verify contracts directory existence
  if (!fs.existsSync(contractsDir)) {
    throw new Error(`Contracts directory not found at: ${contractsDir}`);
  }

  // 2. Check if sui binary is available in PATH
  let suiAvailable = false;
  try {
    const versionOutput = execSync('sui --version', { stdio: 'pipe' }).toString();
    console.log(`📦 Sui CLI detected: ${versionOutput.trim()}`);
    suiAvailable = true;
  } catch (err) {
    console.warn('⚠️  Sui CLI is not detected in your system PATH.');
  }

  if (suiAvailable) {
    console.log('🔨 Compiling Move package...');
    execSync('sui move build', { cwd: contractsDir, stdio: 'inherit' });

    console.log('🌐 Publishing package to Sui Testnet...');
    const publishCmd = 'sui client publish --gas-budget 50000000 --json';
    const outputRaw = execSync(publishCmd, { cwd: contractsDir, stdio: 'pipe' }).toString();
    
    try {
      const publishResult = JSON.parse(outputRaw);
      const packageObject = publishResult.objectChanges?.find(
        (change: any) => change.type === 'published'
      );

      const packageId = packageObject?.packageId;
      if (!packageId) {
        throw new Error('Could not parse published packageId from transaction response.');
      }

      console.log(`🎉 [SUCCESS] Move package published to Sui Testnet!`);
      console.log(`   Package ID: ${packageId}`);
      updateEnvLocal(envFilePath, packageId);
    } catch (e: any) {
      console.error('❌ Failed to parse publish transaction output:', e.message);
      console.log('Raw output:', outputRaw);
    }
  } else {
    console.log('\n======================================================');
    console.log('ℹ️  SUI CLI MANUAL PUBLISH INSTRUCTIONS');
    console.log('======================================================');
    console.log('To publish the contract to Sui Testnet:');
    console.log('1. Install Sui CLI (https://docs.sui.io/guides/developer/getting-started/sui-install)');
    console.log('2. Run:');
    console.log('   cd contracts');
    console.log('   sui client switch --env testnet');
    console.log('   sui client publish --gas-budget 50000000');
    console.log('3. Copy the "Published Package ID" and update PACKAGE_ID in .env.local');
    console.log('======================================================\n');
  }
}

function updateEnvLocal(filePath: string, packageId: string) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${filePath} not found. Skipping auto-update.`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('PACKAGE_ID=')) {
    content = content.replace(/PACKAGE_ID=.*/, `PACKAGE_ID=${packageId}`);
  } else {
    content += `\nPACKAGE_ID=${packageId}\n`;
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`📝 Updated PACKAGE_ID in ${filePath}`);
}

deployContract().catch((err) => {
  console.error('❌ Deployment script error:', err);
  process.exit(1);
});

