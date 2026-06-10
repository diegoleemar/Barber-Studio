import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const host = headers().get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('192.168.') || host.includes('10.0.');
  if (!isLocal) notFound();

  const supabase = createAdminClient();

  const { data: barbers } = await supabase
    .from('barbers')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: requests } = await supabase
    .from('payment_requests')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: config } = await supabase
    .from('platform_config')
    .select('*')
    .single();

  return (
    <AdminClient
      barbers={barbers || []}
      requests={requests || []}
      config={config}
    />
  );
}
