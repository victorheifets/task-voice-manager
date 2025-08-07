// Script to create a demo user with simple credentials
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anoupmenvlacdpqcrvzw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIwODE0NSwiZXhwIjoyMDY2Nzg0MTQ1fQ.yEuK-CUytclOmy0jCzwwuovDfPDjWcr-z9gusJqyO_I';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDemoUser() {
  const email = 'demo@test.com';
  const password = 'demo123';
  
  console.log('🔧 Creating demo user...');
  
  // Delete existing if present
  const { data: users } = await supabase.auth.admin.listUsers();
  const existingUser = users?.users?.find(u => u.email === email);
  
  if (existingUser) {
    await supabase.auth.admin.deleteUser(existingUser.id);
    console.log('🗑️ Removed existing demo user');
  }
  
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      status: 'approved'
    }
  });
  
  if (createError) {
    console.error('❌ Error creating demo user:', createError);
    return;
  }
  
  console.log('✅ Demo user created successfully!');
  console.log('📧 Email: demo@test.com');
  console.log('🔑 Password: demo123');
  console.log('🆔 User ID:', newUser.user.id);
  console.log('🔗 Has identities:', newUser.user.identities?.length > 0 ? '✅' : '❌');
  
  console.log('\n🎯 Ready to test in production!');
  console.log('Production URL: https://task-voice-manager-2fhy9covd-victorheifets-projects.vercel.app');
}

createDemoUser().catch(console.error);