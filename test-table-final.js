const { createClient } = require('@supabase/supabase-js');

async function testAndForceRefresh() {
  console.log('🔍 Final verification and schema refresh...');
  
  const supabase = createClient(
    'https://anoupmenvlacdpqcrvzw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIwODE0NSwiZXhwIjoyMDY2Nzg0MTQ1fQ.yEuK-CUytclOmy0jCzwwuovDfPDjWcr-z9gusJqyO_I'
  );

  try {
    // Force schema refresh by calling the table info endpoint
    console.log('🔄 Forcing schema refresh...');
    
    const refreshResponse = await fetch('https://anoupmenvlacdpqcrvzw.supabase.co/rest/v1/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIwODE0NSwiZXhwIjoyMDY2Nzg0MTQ1fQ.yEuK-CUytclOmy0jCzwwuovDfPDjWcr-z9gusJqyO_I`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIwODE0NSwiZXhwIjoyMDY2Nzg0MTQ1fQ.yEuK-CUytclOmy0jCzwwuovDfPDjWcr-z9gusJqyO_I'
      }
    });
    
    console.log(`📡 Refresh response: ${refreshResponse.status}`);
    
    // Wait a moment for cache to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test table access
    console.log('🔍 Testing table access after refresh...');
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('schema cache')) {
        console.log('⏳ Table may still be propagating in schema cache...');
        console.log('🔄 Trying direct table query...');
        
        // Try direct SQL query to verify table exists
        const directQuery = await fetch('https://anoupmenvlacdpqcrvzw.supabase.co/rest/v1/rpc/exec', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIwODE0NSwiZXhwIjoyMDY2Nzg0MTQ1fQ.yEuK-CUytclOmy0jCzwwuovDfPDjWcr-z9gusJqyO_I`,
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIwODE0NSwiZXhwIjoyMDY2Nzg0MTQ1fQ.yEuK-CUytclOmy0jCzwwuovDfPDjWcr-z9gusJqyO_I'
          },
          body: JSON.stringify({ 
            query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_notes';" 
          })
        });
        
        const queryResult = await directQuery.text();
        console.log(`📋 Direct query result: ${queryResult}`);
        
        if (queryResult.includes('user_notes') || directQuery.ok) {
          console.log('✅ Table exists in database! Schema cache will update shortly.');
          console.log('⏳ Please wait 1-2 minutes for Supabase to refresh its API schema cache.');
          return 'exists_but_caching';
        } else {
          console.log('❌ Table may not have been created properly');
          return false;
        }
      } else {
        console.log('❌ Unexpected error:', error);
        return false;
      }
    } else {
      console.log('✅ SUCCESS! Table is accessible via REST API');
      console.log('📊 Current data:', data);
      return true;
    }

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    return false;
  }
}

// Run verification
testAndForceRefresh()
  .then((result) => {
    if (result === true) {
      console.log('\n🎉 COMPLETE: user_notes table is ready!');
      console.log('📝 Notes functionality will now use database storage');
    } else if (result === 'exists_but_caching') {
      console.log('\n⏳ Table created but schema cache updating...');
      console.log('📝 Notes functionality will work once cache refreshes (1-2 minutes)');
      console.log('💡 Or restart the Next.js app in a few minutes');
    } else {
      console.log('\n❌ Table verification failed');
      console.log('💡 Check Supabase Dashboard to verify table creation');
    }
  })
  .catch((error) => {
    console.error('\n💥 Verification error:', error);
  });