// Global teardown for Playwright tests
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Clean up test artifacts
    console.log('Cleaning up test artifacts...');
    
    // Additional cleanup if needed
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    throw error;
  }
}

export default globalTeardown;