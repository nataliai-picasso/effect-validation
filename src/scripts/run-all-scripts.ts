import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface ScriptInfo {
  name: string;
  path: string;
}

function getScriptsInOrder(scriptsDir: string): ScriptInfo[] {
  // Read all .ts files in the scripts directory
  const files = fs.readdirSync(scriptsDir)
    .filter(file => file.endsWith('.ts') && file !== 'run-all-scripts.ts') // Exclude self
    .sort(); // Sort alphabetically
  
  return files.map(file => ({
    name: file,
    path: path.join(scriptsDir, file)
  }));
}

function runScript(scriptInfo: ScriptInfo, tsConfigPath: string): void {
  console.log('\n' + '='.repeat(60));
  console.log('("Running script:")', scriptInfo.name);
  console.log('='.repeat(60));
  
  try {
    // Execute the script using ts-node
    execSync(`ts-node --project ${tsConfigPath} ${scriptInfo.path}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..', '..')
    });
    
    console.log('("Script completed successfully:")', scriptInfo.name);
  } catch (error) {
    console.error('("Script failed:")', scriptInfo.name);
    if (error instanceof Error) {
      console.error('("Error:")', error.message);
    }
    process.exit(1);
  }
}

function main(): void {
  const scriptsDir = __dirname;
  const tsConfigPath = path.join(__dirname, '..', '..', 'tsconfig.scripts.json');
  
  console.log('("Starting automated script execution...")', '');
  console.log('("Scripts directory:")', scriptsDir);
  console.log('("TypeScript config:")', tsConfigPath);
  
  // Get all scripts in alphabetical order
  const scripts = getScriptsInOrder(scriptsDir);
  
  if (scripts.length === 0) {
    console.log('("No scripts found to execute")', '');
    return;
  }
  
  console.log('("\nScripts to execute (in order):")', '');
  scripts.forEach((script, index) => {
    console.log(`  ${index + 1}. ${script.name}`);
  });
  
  // Execute each script in order
  scripts.forEach(script => {
    runScript(script, tsConfigPath);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('("All scripts completed successfully!")', '');
  console.log('='.repeat(60));
}

// Run the master script
main();

