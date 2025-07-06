import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygvzeoyhpesjtaqxijsk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlndnplb3locGVzanRhcXhpanNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2OTczNTIsImV4cCI6MjA2NzI3MzM1Mn0.EYIl4cxqbVZcYFbFUqwRPUpyDo5v1zNmVUtsxedb-9g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing Supabase authentication...');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test123456',
      options: {
        emailRedirectTo: 'http://localhost:8080/auth/callback'
      }
    });

    if (error) {
      console.error('Authentication Error:');
      console.error('Code:', error.status);
      console.error('Message:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
    } else {
      console.log('Authentication Success:');
      console.log('Data:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Exception:', err.message);
    console.error('Stack:', err.stack);
  }
}

testAuth();
