import dotenv from 'dotenv';
dotenv.config();

import { supabaseService, supabase } from '../services/supabaseService';
import { x12270271CompleteQuestionnaire } from '../data/x12-270-271-complete';

/**
 * Seed Script: Populate questionnaire_templates with existing X12 270/271 form
 * Run with: npx ts-node src/scripts/seedQuestionnaireTemplates.ts
 */

async function seedTemplates() {
  console.log('🌱 Starting questionnaire template seeding...\n');

  try {
    // 1. Check if Lisa Wilson exists, if not create her
    console.log('1️⃣ Checking for Lisa Wilson (admin user)...');

    const { data: existingUsers, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'lisa.wilson@availity.com');

    let lisaWilson;
    
    if (!existingUsers || existingUsers.length === 0) {
      console.log('   Creating Lisa Wilson...');
      lisaWilson = await supabaseService.createUser({
        email: 'lisa.wilson@availity.com',
        first_name: 'Lisa',
        last_name: 'Wilson',
        user_type: 'availity',
        is_admin: true,
        status: 'active'
      });
      console.log(`   ✅ Created Lisa Wilson (ID: ${lisaWilson.id})`);
    } else {
      lisaWilson = existingUsers[0];
      
      // Update to admin if not already
      if (!lisaWilson.is_admin) {
        console.log('   Updating Lisa Wilson to admin...');
        const { data, error } = await supabase
          .from('users')
          .update({ is_admin: true })
          .eq('id', lisaWilson.id)
          .select()
          .single();

        if (error) throw error;
        lisaWilson = data;
      }
      
      console.log(`   ✅ Found Lisa Wilson (ID: ${lisaWilson.id}, Admin: ${lisaWilson.is_admin})`);
    }

    // 2. Check if X12 270/271 template already exists
    console.log('\n2️⃣ Checking for existing X12 270/271 template...');
    
    const existingTemplates = await supabaseService.getQuestionnaireTemplatesByType('270/271');
    
    if (existingTemplates.length > 0) {
      console.log(`   ⚠️  Found ${existingTemplates.length} existing template(s):`);
      existingTemplates.forEach(t => {
        console.log(`      - Version ${t.version} (${t.status})`);
      });
      console.log('\n   Skipping seed to avoid duplicates.');
      console.log('   To re-seed, delete existing templates first.');
      return;
    }

    // 3. Create X12 270/271 template
    console.log('\n3️⃣ Creating X12 270/271 template...');
    
    const template = await supabaseService.createQuestionnaireTemplate({
      transaction_type: '270/271',
      version: x12270271CompleteQuestionnaire.version,
      status: 'published', // Start as published
      config: x12270271CompleteQuestionnaire,
      created_by: lisaWilson.id,
      published_by: lisaWilson.id,
      published_at: new Date().toISOString()
    });

    console.log(`   ✅ Created template (ID: ${template.id})`);
    console.log(`      Transaction Type: ${template.transaction_type}`);
    console.log(`      Version: ${template.version}`);
    console.log(`      Status: ${template.status}`);
    console.log(`      Sections: ${template.config.sections.length}`);

    // 4. Create initial version history entry
    console.log('\n4️⃣ Creating version history...');
    
    const version = await supabaseService.createQuestionnaireVersion({
      template_id: template.id!,
      version: template.version,
      config: template.config,
      changes_summary: 'Initial migration from hardcoded questionnaire',
      created_by: lisaWilson.id
    });

    console.log(`   ✅ Created version history (ID: ${version.id})`);

    // 5. Summary
    console.log('\n✅ Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Admin User: Lisa Wilson (${lisaWilson.email})`);
    console.log(`   - Template: X12 270/271 v${template.version}`);
    console.log(`   - Status: ${template.status}`);
    console.log(`   - Sections: ${template.config.sections.length}`);
    console.log(`   - Questions: ${template.config.sections.reduce((sum: number, s: any) => sum + s.questions.length, 0)}`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Lisa Wilson can now log in as admin');
    console.log('   2. Access admin portal at /admin/questionnaires');
    console.log('   3. Edit and publish new versions');
    console.log('   4. Users will automatically get latest published version\n');

  } catch (error: any) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed script
seedTemplates()
  .then(() => {
    console.log('🏁 Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

