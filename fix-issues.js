// Quick fix script for common FocusGuardian issues
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing common FocusGuardian issues...\n');

// 1. Ensure all required directories exist
const requiredDirs = [
  'src/app',
  'src/components',
  'src/lib',
  'src/models',
  'src/hooks',
  'convex/_generated',
  'public'
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// 2. Check for required files
const requiredFiles = [
  'next-env.d.ts',
  'postcss.config.js',
  'tsconfig.json',
  '.env.local',
  'convex/_generated/api.ts',
  'convex/_generated/dataModel.ts'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('❌ Missing files:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
} else {
  console.log('✅ All required files are present');
}

// 3. Check package.json dependencies
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['next', 'react', 'react-dom', 'typescript', 'tailwindcss'];
  const missingDeps = requiredDeps.filter(dep => !pkg.dependencies[dep] && !pkg.devDependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log('❌ Missing dependencies:');
    missingDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('\n💡 Run: npm install to install missing dependencies');
  } else {
    console.log('✅ All required dependencies are present');
  }
}

console.log('\n🚀 Fixes applied! Try running:');
console.log('   npm install');
console.log('   npm run dev');