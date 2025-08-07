// Direct test of Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://anoupmenvlacdpqcrvzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDgxNDUsImV4cCI6MjA2Njc4NDE0NX0.gxlDNSLdkjvxmBOxSWk8sQQxNAhv6szCZV0QiGdV3FI';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection directly...');
  console.log('URL:', supabaseUrl);
  console.log('Anon key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test 1: Basic connection (should work with anon key)
    console.log('\n📡 Test 1: Basic connection test...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log('❌ Basic connection error:', error.message);
    } else {
      console.log('✅ Basic connection successful');
    }
    
    // Test 2: Auth endpoint test (this is what's failing)
    console.log('\n🔐 Test 2: Authentication endpoint test...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@test.com',
      password: 'demo123'
    });
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      console.log('Auth error details:', authError);
    } else {
      console.log('✅ Authentication successful');
      console.log('User:', authData.user?.email);
    }
    
    // Test 3: Check project health
    console.log('\n🏥 Test 3: Project health check...');
    const healthResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    console.log('Health status:', healthResponse.status);
    if (healthResponse.status === 401) {
      console.log('❌ Project health check failed - 401 Unauthorized');
      const errorText = await healthResponse.text();
      console.log('Error response:', errorText);
    } else {
      console.log('✅ Project health check passed');
    }
    
  } catch (error) {
    console.error('💥 Connection test failed:', error.message);
  }
}

testSupabaseConnection();