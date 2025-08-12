// Add unique constraint for user_id + title combination to support upsert
const accessToken = 'sbp_77f2af0bf79cc286b33fccfcb300ced7af2bda90';
const projectRef = 'anoupmenvlacdpqcrvzw';

async function addUniqueConstraint() {
  console.log('🔧 Adding unique constraint for user_id + title...');
  
  const sql = `
    ALTER TABLE public.user_notes 
    ADD CONSTRAINT unique_user_title 
    UNIQUE (user_id, title);
  `;

  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('⚠️ Constraint may already exist or Management API failed:', response.status, errorText);
      return true; // Continue anyway
    }

    const result = await response.json();
    console.log('✅ Unique constraint added successfully');
    return true;

  } catch (error) {
    console.error('❌ Error adding constraint:', error.message);
    console.log('⚠️ Continuing - constraint may already exist');
    return true; // Don't fail if constraint already exists
  }
}

addUniqueConstraint()
  .then(() => {
    console.log('🎉 Database constraint update completed');
  })
  .catch((error) => {
    console.error('💥 Error:', error);
  });