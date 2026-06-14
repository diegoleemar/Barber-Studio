import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import BookingFlow from './BookingFlow';

export const dynamic = 'force-dynamic';

const RESERVED = new Set([
  'dashboard',
  'login',
  'onboarding',
  'auth',
  'api',
  'admin',
  'about',
  '_next',
  'favicon.ico'
]);

export default async function PublicProfilePage({
  params
}: {
  params: { username: string };
}) {
  if (RESERVED.has(params.username.toLowerCase())) notFound();

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, profession:professions(*)')
    .eq('username', params.username)
    .maybeSingle();

  if (!profile) notFound();
  if (!profile.profession) notFound();

  if (profile.subscription_status !== 'active') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
          </div>
          <h1 className="text-[22px] font-extrabold text-[#09090b]">{profile.business_name}</h1>
          <p className="mt-2 text-[14px] text-[#52525b]">Este profesional aún no tiene habilitadas las reservas por acá. Por favor, comunícate directamente.</p>
        </div>
      </main>
    );
  }

  const [{ data: services }, { data: schedules }, { data: payments }] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('schedules')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('is_active', true),
    supabase
      .from('payment_methods')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('is_active', true),
  ]);

  return (
    <BookingFlow
      profile={profile}
      profession={profile.profession}
      services={services || []}
      schedules={schedules || []}
      payments={payments || []}
    />
  );
}

export async function generateMetadata({ params }: { params: { username: string } }) {
  if (RESERVED.has(params.username.toLowerCase())) return {};
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name, description')
    .eq('username', params.username)
    .maybeSingle();
  if (!profile) return {};
  return {
    title: `${profile.business_name} — Reserva tu cita`,
    description: profile.description || `Reserva online con ${profile.business_name}`
  };
}
