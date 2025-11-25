import { supabase } from '../services/supabaseService';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('🚀 Running database migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/001_questionnaire_templates.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // Show first 100 chars of statement
      const preview = statement.substring(0, 100).replace(/\n/g, ' ');
      console.log(`  ${preview}${statement.length > 100 ? '...' : ''}`);

      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        // Continue with other statements
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
      console.log('');
    }

    console.log('✅ Migration completed!\n');

    // Now set Lisa Wilson as admin
    console.log('Setting Lisa Wilson as admin...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('email', 'admin@availity.com');

    if (updateError) {
      console.error('❌ Error setting admin:', updateError);
    } else {
      console.log('✅ Lisa Wilson is now an admin!\n');
    }

    // Verify
    const { data: user } = await supabase
      .from('users')
      .select('email, first_name, last_name, is_admin')
      .eq('email', 'admin@availity.com')
      .single();

    if (user) {
      console.log('Verified user:');
      console.log(JSON.stringify(user, null, 2));
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

