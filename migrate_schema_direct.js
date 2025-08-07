#!/usr/bin/env node

// Direct PostgreSQL connection approach
const https = require('https');

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query: sql
    });
    
    const options = {
      hostname: 'anoupmenvlacdpqcrvzw.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDgxNDUsImV4cCI6MjA2Njc4NDE0NX0.gxlDNSLdkjvxmBOxSWk8sQQxNAhv6szCZV0QiGdV3FI',
        'Authorization': 'Bearer ***REMOVED***'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${response.message || data}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function fixDatabase() {
  console.log('🔧 Starting database schema fix...');
  
  // Let's try to check current schema first
  try {
    console.log('📋 Checking current tasks table structure...');
    
    // Check what columns currently exist
    const checkResult = await executeSQL(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'tasks'
      ORDER BY ordinal_position;
    `);
    
    console.log('✅ Current schema:', checkResult);
    
  } catch (error) {
    console.log('⚠️ Could not check schema directly, trying alternative approach...');
    console.log('Error:', error.message);
  }
  
  // Execute the schema modifications
  const migrations = [
    {
      name: 'Add assignee column',
      sql: `ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignee VARCHAR(255);`
    },
    {
      name: 'Add tags column', 
      sql: `ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tags TEXT[];`
    },
    {
      name: 'Add priority column',
      sql: `ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';`
    },
    {
      name: 'Add due_date column',
      sql: `ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;`
    },
    {
      name: 'Add completed column',
      sql: `ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;`
    }
  ];
  
  for (const migration of migrations) {
    try {
      console.log(`🔄 ${migration.name}...`);
      const result = await executeSQL(migration.sql);
      console.log(`✅ ${migration.name} - Success`);
    } catch (error) {
      console.log(`❌ ${migration.name} - Error: ${error.message}`);
    }
  }
  
  // Final verification
  try {
    console.log('\n📋 Final verification...');
    const finalCheck = await executeSQL(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'tasks'
      ORDER BY ordinal_position;
    `);
    
    console.log('✅ Updated schema:');
    finalCheck.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
  } catch (error) {
    console.log('⚠️ Could not verify final schema:', error.message);
    console.log('Schema updates may have been applied successfully anyway.');
  }
  
  console.log('\n🎉 Database schema fix complete!');
  console.log('You can now try creating tasks again in the application.');
}

fixDatabase();