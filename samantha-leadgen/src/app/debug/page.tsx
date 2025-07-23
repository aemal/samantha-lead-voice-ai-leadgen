'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugPage() {
  const { user, session } = useAuth();
  const [dbStatus, setDbStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkDatabase() {
      try {
        // Check auth status
        const { data: { session } } = await supabase.auth.getSession();
        
        // Try to fetch leads
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .limit(5);
        
        // Try to fetch user profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .limit(5);
        
        // Check table counts
        const { count: leadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });
          
        const { count: callsCount } = await supabase
          .from('lead_phone_calls')
          .select('*', { count: 'exact', head: true });
          
        const { count: emailsCount } = await supabase
          .from('lead_emails')
          .select('*', { count: 'exact', head: true });

        setDbStatus({
          session: !!session,
          sessionData: session,
          leads: leads || [],
          leadsError,
          profiles: profiles || [],
          profilesError,
          counts: {
            leads: leadsCount,
            calls: callsCount,
            emails: emailsCount
          },
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        });
      } catch (error) {
        setDbStatus({ error: error });
      } finally {
        setLoading(false);
      }
    }

    checkDatabase();
  }, []);

  if (loading) return <div className="p-8">Loading debug info...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Database Debug Info</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Auth Status:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              authenticated: dbStatus.session,
              userId: dbStatus.sessionData?.user?.id,
              email: dbStatus.sessionData?.user?.email
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Supabase URL:</h2>
          <p className="text-sm">{dbStatus.supabaseUrl}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Table Counts:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(dbStatus.counts, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Leads Query:</h2>
          {dbStatus.leadsError ? (
            <p className="text-red-600">Error: {dbStatus.leadsError.message}</p>
          ) : (
            <div>
              <p className="text-green-600 mb-2">Success! Found {dbStatus.leads.length} leads</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(dbStatus.leads.slice(0, 2), null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Full Debug Data:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(dbStatus, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}