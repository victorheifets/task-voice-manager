// Quick script to approve users
// Run with: node approve_user.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anoupmenvlacdpqcrvzw.supabase.co';
const supabaseServiceKey = '***REMOVED***';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function approveUser(email) {
  try {
    // First, check if users table exists
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) {
      console.log('Users table not found, checking auth users directly...');
      
      // Get auth users
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Auth error:', authError);
        return;
      }
      
      console.log('Auth users found:', authUsers.map(u => ({ email: u.email, created_at: u.created_at })));
      
      const user = authUsers.find(u => u.email === email);
      if (user) {
        console.log(`✅ User ${email} exists in auth system`);
        console.log('Note: No approval needed - user can already login');
      } else {
        console.log(`❌ User ${email} not found`);
      }
      
      return;
    }
    
    if (users && users.length > 0) {
      // Update user status to approved
      const { data, error: updateError } = await supabase
        .from('users')
        .update({ status: 'approved' })
        .eq('email', email);
        
      if (updateError) {
        console.error('Update error:', updateError);
        return;
      }
      
      console.log(`✅ User ${email} approved successfully!`);
    } else {
      console.log(`❌ User ${email} not found in users table`);
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

// Approve the test user
const emailToApprove = process.argv[2] || 'testuser@gmail.com';
console.log(`Approving user: ${emailToApprove}`);
approveUser(emailToApprove);