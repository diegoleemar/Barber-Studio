'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Industry, Profession, SlotConfig } from '@/lib/types';
import { professionToSlotConfig } from '@/lib/time';

interface IndustryContextValue {
  industries: Industry[];
  professions: Profession[];
  selectedIndustry: Industry | null;
  selectedProfession: Profession | null;
  slotConfig: SlotConfig | null;
  loading: boolean;
  setSelectedIndustry: (industry: Industry | null) => void;
  setSelectedProfession: (profession: Profession | null) => void;
  getProfessionsByIndustry: (industryId: string) => Profession[];
  getIndustryBySlug: (slug: string) => Industry | undefined;
  getProfessionBySlug: (slug: string) => Profession | undefined;
}

const IndustryContext = createContext<IndustryContextValue | null>(null);

export function IndustryProvider({ children }: { children: ReactNode }) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const [indRes, profRes] = await Promise.all([
        supabase.from('industries').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('professions').select('*, industry:industries(*)').eq('is_active', true).order('sort_order'),
      ]);
      if (indRes.data) setIndustries(indRes.data);
      if (profRes.data) setProfessions(profRes.data);
      setLoading(false);
    })();
  }, []);

  const getProfessionsByIndustry = (industryId: string) =>
    professions.filter((p) => p.industry_id === industryId);

  const getIndustryBySlug = (slug: string) =>
    industries.find((i) => i.slug === slug);

  const getProfessionBySlug = (slug: string) =>
    professions.find((p) => p.slug === slug);

  const slotConfig = selectedProfession
    ? professionToSlotConfig(selectedProfession)
    : null;

  return (
    <IndustryContext.Provider
      value={{
        industries,
        professions,
        selectedIndustry,
        selectedProfession,
        slotConfig,
        loading,
        setSelectedIndustry,
        setSelectedProfession,
        getProfessionsByIndustry,
        getIndustryBySlug,
        getProfessionBySlug,
      }}
    >
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  const ctx = useContext(IndustryContext);
  if (!ctx) throw new Error('useIndustry must be used within IndustryProvider');
  return ctx;
}
