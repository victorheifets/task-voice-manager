// Script to completely recreate testuser@gmail.com with proper identities
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anoupmenvlacdpqcrvzw.supabase.co';
const supabaseServiceKey = '***REMOVED***';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function recreateTestUser() {
  console.log('🗑️ Deleting existing testuser@gmail.com...');
  
  // First, get and delete existing user
  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users?.users?.find(u => u.email === 'testuser@gmail.com');
  
  if (testUser) {
    await supabase.auth.admin.deleteUser(testUser.id);
    console.log('✅ Deleted existing user');
  }
  
  console.log('🔧 Creating fresh user with proper identity...');
  
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: 'testuser@gmail.com',
    password: 'TestPass123!',
    email_confirm: true,
    user_metadata: {
      status: 'approved'
    }
  });
  
  if (createError) {
    console.error('❌ Error creating user:', createError);
    return;
  }
  
  console.log('✅ Successfully created testuser@gmail.com');
  console.log('📧 Email: testuser@gmail.com');
  console.log('🔑 Password: TestPass123!');
  console.log('📋 Status: approved');
  console.log('🆔 User ID:', newUser.user.id);
  console.log('🔗 Identities:', newUser.user.identities?.length || 0);
  
  // Verify the user can be retrieved
  const { data: verifyUser } = await supabase.auth.admin.getUserById(newUser.user.id);
  console.log('🔍 Verification - User exists:', verifyUser.user ? '✅' : '❌');
  console.log('🔍 Verification - Has identities:', verifyUser.user?.identities?.length > 0 ? '✅' : '❌');
}

recreateTestUser().catch(console.error);