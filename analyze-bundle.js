#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the built bundle for size optimization opportunities
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const DIST_DIR = './dist';
const SIZE_THRESHOLD_KB = 100; // Warn for files larger than 100KB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeDirectory(dir, results = []) {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory()) {
        analyzeDirectory(filePath, results);
      } else {
        const ext = extname(file);
        const size = stat.size;
        
        results.push({
          path: filePath.replace('./dist/', ''),
          size,
          sizeFormatted: formatBytes(size),
          type: ext,
          isLarge: size > SIZE_THRESHOLD_KB * 1024
        });
      }
    }
  } catch (error) {
    console.error(`❌ Error analyzing directory ${dir}:`, error.message);
  }
  
  return results;
}

function generateReport(files) {
  console.log('📊 JSR-352 Batch Tool - Bundle Analysis Report');
  console.log('='.repeat(50));
  
  // Sort by size (largest first)
  const sortedFiles = files.sort((a, b) => b.size - a.size);
  
  // Calculate totals
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const jsFiles = files.filter(f => f.type === '.js');
  const cssFiles = files.filter(f => f.type === '.css');
  const assetFiles = files.filter(f => !['.js', '.css', '.html'].includes(f.type));
  
  console.log(`\n📈 Summary:`);
  console.log(`Total Bundle Size: ${formatBytes(totalSize)}`);
  console.log(`JavaScript: ${formatBytes(jsFiles.reduce((sum, f) => sum + f.size, 0))} (${jsFiles.length} files)`);
  console.log(`CSS: ${formatBytes(cssFiles.reduce((sum, f) => sum + f.size, 0))} (${cssFiles.length} files)`);
  console.log(`Assets: ${formatBytes(assetFiles.reduce((sum, f) => sum + f.size, 0))} (${assetFiles.length} files)`);
  
  console.log(`\n🔍 Largest Files:`);
  sortedFiles.slice(0, 10).forEach((file, index) => {
    const warning = file.isLarge ? ' ⚠️' : '';
    console.log(`${index + 1}. ${file.path} - ${file.sizeFormatted}${warning}`);
  });
  
  // Optimization suggestions
  console.log(`\n💡 Optimization Suggestions:`);
  
  const largeFiles = files.filter(f => f.isLarge);
  if (largeFiles.length > 0) {
    console.log(`• ${largeFiles.length} files are larger than ${SIZE_THRESHOLD_KB}KB - consider code splitting`);
  }
  
  const duplicateNames = files
    .map(f => f.path.split('/').pop())
    .filter((name, index, arr) => arr.indexOf(name) !== index);
  
  if (duplicateNames.length > 0) {
    console.log(`• Found potential duplicate files: ${duplicateNames.join(', ')}`);
  }
  
  if (totalSize > 1024 * 1024) { // > 1MB
    console.log(`• Total bundle size is ${formatBytes(totalSize)} - consider lazy loading`);
  }
  
  console.log(`• Use 'npm run build -- --analyze' for detailed dependency analysis`);
  console.log(`• Consider implementing React.lazy() for dynamic imports`);
  console.log(`• Review if all dependencies are actually used`);
}

// Main execution
try {
  console.log('🔍 Analyzing bundle...\n');
  
  const files = analyzeDirectory(DIST_DIR);
  
  if (files.length === 0) {
    console.log('❌ No files found in dist directory. Run "npm run build" first.');
    process.exit(1);
  }
  
  generateReport(files);
  
  console.log('\n✅ Analysis complete!');
  
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}