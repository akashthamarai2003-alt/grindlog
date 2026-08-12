const fs = require('fs');
const path = require('path');

const filesToCombine = [
  'fitness_os_phase5_migration.sql',
  'fitness_os_phase6_grocery.sql',
  'fitness_os_phase6_migration.sql',
  'fitness_os_phase7_migration.sql',
  'fitness_os_scanner_migration.sql'
];

let combinedSQL = '-- ============================================\n';
combinedSQL += '-- ULTRA SAFE COMBINED PENDING MIGRATIONS FOR SUPABASE\n';
combinedSQL += '-- ============================================\n\n';

for (const file of filesToCombine) {
  const filePath = path.join(__dirname, 'lib', 'db', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix existing bad drops in the source SQL
    content = content.replace(/DROP POLICY IF EXISTS (.*?) ON storage;/gi, 'DROP POLICY IF EXISTS $1 ON storage.objects;');
    
    // Automatically inject DROP POLICY IF EXISTS before CREATE POLICY
    // We allow dot (.) in table names to capture schemas like storage.objects
    const policyRegex = /CREATE\s+POLICY\s+(".*?")\s+ON\s+([a-zA-Z0-9_\.]+)/gi;
    content = content.replace(policyRegex, (match, policyName, tableName) => {
      return `DROP POLICY IF EXISTS ${policyName} ON ${tableName};\n${match}`;
    });

    // Automatically inject DROP TRIGGER IF EXISTS before CREATE TRIGGER
    const triggerRegex = /CREATE\s+TRIGGER\s+([a-zA-Z0-9_]+)\s+BEFORE\s+(INSERT|UPDATE|DELETE)\s+ON\s+([a-zA-Z0-9_\.]+)/gi;
    content = content.replace(triggerRegex, (match, triggerName, event, tableName) => {
      return `DROP TRIGGER IF EXISTS ${triggerName} ON ${tableName};\n${match}`;
    });
    
    // Also catch some triggers formatted with newlines or different spaces
    const triggerRegex2 = /CREATE\s+TRIGGER\s+([a-zA-Z0-9_]+)\s+[\s\S]*?ON\s+([a-zA-Z0-9_\.]+)/gi;
    content = content.replace(triggerRegex2, (match, triggerName, tableName) => {
        if (!match.includes('BEFORE') && !match.includes('AFTER')) {
           return match;
        }
        return match;
    });

    // Hardcoded replace just in case
    content = content.replace(
      'CREATE TRIGGER update_fitness_os_scans_updated_at', 
      'DROP TRIGGER IF EXISTS update_fitness_os_scans_updated_at ON fitness_os_scans;\nCREATE TRIGGER update_fitness_os_scans_updated_at'
    );
    
    content = content.replace(
      'CREATE TRIGGER trg_fitness_os_coach_sessions_updated_at', 
      'DROP TRIGGER IF EXISTS trg_fitness_os_coach_sessions_updated_at ON fitness_os_coach_sessions;\nCREATE TRIGGER trg_fitness_os_coach_sessions_updated_at'
    );
    
    content = content.replace(
      'CREATE TRIGGER trg_fitness_os_subscriptions_updated_at', 
      'DROP TRIGGER IF EXISTS trg_fitness_os_subscriptions_updated_at ON fitness_os_subscriptions;\nCREATE TRIGGER trg_fitness_os_subscriptions_updated_at'
    );

    combinedSQL += `-- >>> START OF ${file} <<<\n`;
    combinedSQL += content + '\n\n';
    combinedSQL += `-- >>> END OF ${file} <<<\n\n`;
  }
}

// Ensure no double drops exist by running a cleanup
combinedSQL = combinedSQL.replace(/DROP POLICY IF EXISTS ("[^"]+") ON storage.objects;\s*DROP POLICY IF EXISTS \1 ON storage.objects;/gi, 'DROP POLICY IF EXISTS $1 ON storage.objects;');
combinedSQL = combinedSQL.replace(/DROP TRIGGER IF EXISTS ([a-zA-Z0-9_]+) ON ([a-zA-Z0-9_]+);\s*DROP TRIGGER IF EXISTS/gi, 'DROP TRIGGER IF EXISTS');


const artifactPath = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\6be243df-4a53-4d80-86e1-497ebebc3cfe\\pending_database_migrations_safe.md';

const markdownContent = `# Pending Database Migrations (Ultra Safe Version)

My apologies! It looks like there was a typo in the original scanner migration file (Phase 3). It was trying to drop policies on \`storage\` instead of \`storage.objects\`, which is what caused the \`relation "storage" does not exist\` error.

I have fixed that typo in this final script.

Please copy this new SQL script below and run it in your **Supabase SQL Editor**:

\`\`\`sql
${combinedSQL}
\`\`\`
`;

fs.writeFileSync(artifactPath, markdownContent);
console.log('Artifact created successfully at', artifactPath);
