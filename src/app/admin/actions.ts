'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function activateUser(profileId: string, plan: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'active', subscription_plan: plan })
    .eq('id', profileId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function deactivateUser(profileId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'inactive', subscription_plan: null })
    .eq('id', profileId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function verifyPayment(requestId: string, profileId: string, plan: string) {
  const supabase = createAdminClient();
  const { error: reqError } = await supabase
    .from('payment_requests')
    .update({ status: 'verified', verified_at: new Date().toISOString() })
    .eq('id', requestId);
  if (reqError) throw new Error(reqError.message);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ subscription_status: 'active', subscription_plan: plan })
    .eq('id', profileId);
  if (profileError) throw new Error(profileError.message);

  revalidatePath('/admin');
}

export async function rejectPayment(requestId: string, notas: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('payment_requests')
    .update({ status: 'rejected', notas_admin: notas })
    .eq('id', requestId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function updatePlatformConfig(config: {
  pago_movil: { banco: string; telefono: string; titular: string };
  transferencia: { banco: string; cuenta: string; titular: string };
  binancepay: { correo: string; id_usuario: string };
}) {
  const supabase = createAdminClient();
  const { data: existing } = await supabase.from('platform_config').select('id').single();
  if (existing) {
    const { error } = await supabase
      .from('platform_config')
      .update({ ...config, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('platform_config')
      .insert({ ...config });
    if (error) throw new Error(error.message);
  }
  revalidatePath('/admin');
}
