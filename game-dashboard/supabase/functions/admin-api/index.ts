import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getUserFromToken(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

async function isAdmin(userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();
    
  return profile?.role === 'admin';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const isUserAdmin = await isAdmin(user.id);
    if (!isUserAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    switch (req.method) {
      case 'GET':
        if (path === 'users') {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          return new Response(
            JSON.stringify(profiles),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;
        
      case 'POST':
        if (path === 'users') {
          const { email, password, name, role } = await req.json();
          
          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
          });
          
          if (authError) throw authError;
          
          // Update profile with role
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role, name })
            .eq('user_id', authData.user.id);
            
          if (profileError) throw profileError;
          
          return new Response(
            JSON.stringify({ message: 'User created successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;
        
      case 'PUT':
        const userId = url.searchParams.get('id');
        if (userId) {
          const updates = await req.json();
          
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('user_id', userId);
            
          if (error) throw error;
          
          return new Response(
            JSON.stringify({ message: 'User updated successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;
        
      case 'DELETE':
        const deleteUserId = url.searchParams.get('id');
        if (deleteUserId) {
          // Delete auth user (cascade will handle profile)
          const { error } = await supabase.auth.admin.deleteUser(deleteUserId);
          
          if (error) throw error;
          
          return new Response(
            JSON.stringify({ message: 'User deleted successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;
    }
    
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in admin-api function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});