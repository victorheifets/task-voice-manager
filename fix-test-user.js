// Quick script to fix testuser@gmail.com in production
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anoupmenvlacdpqcrvzw.supabase.co';
const supabaseServiceKey = '***REMOVED***';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixTestUser() {
  console.log('🔍 Checking testuser@gmail.com status...');
  
  // Get user details
  const { data: users, error: getUserError } = await supabase.auth.admin.listUsers();
  const testUser = users?.users?.find(u => u.email === 'testuser@gmail.com');
  
  if (getUserError) {
    console.error('Error getting users:', getUserError);
    return;
  }
  
  if (!testUser) {
    console.log('❌ testuser@gmail.com not found. Creating new user...');
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'testuser@gmail.com',
      password: 'TestPass123!',
      email_confirm: true,
      user_metadata: {
        status: 'approved'
      }
    });
    
    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }
    
    console.log('✅ Created and activated testuser@gmail.com');
    console.log('Password: TestPass123!');
    return;
  }
  
  console.log('📋 Current user status:');
  console.log('- Email:', testUser.email);
  console.log('- Email confirmed:', testUser.email_confirmed_at ? '✅' : '❌');
  console.log('- Identities count:', testUser.identities?.length || 0);
  console.log('- Status:', testUser.user_metadata?.status || 'not set');
  
  // Fix the user if needed
  if (!testUser.email_confirmed_at || testUser.identities?.length === 0) {
    console.log('🔧 Fixing user...');
    
    // Delete and recreate
    await supabase.auth.admin.deleteUser(testUser.id);
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'testuser@gmail.com',
      password: 'TestPass123!',
      email_confirm: true,
      user_metadata: {
        status: 'approved'
      }
    });
    
    if (createError) {
      console.error('Error recreating user:', createError);
      return;
    }
    
    console.log('✅ Fixed testuser@gmail.com');
    console.log('Password: TestPass123!');
  } else {
    console.log('✅ User looks good, just updating status...');
    
    const { error: updateError } = await supabase.auth.admin.updateUserById(testUser.id, {
      user_metadata: {
        status: 'approved'
      }
    });
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return;
    }
    
    console.log('✅ Updated user status to approved');
  }
}

fixTestUser().catch(console.error);