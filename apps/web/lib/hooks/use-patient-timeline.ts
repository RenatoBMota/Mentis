'use client';

import { useMemo } from 'react';
import { MedicalRecord, Referral } from '@/lib/types';
import { useMedicalRecords } from './use-medical-records';
import { useReferrals } from './use-referrals';

export type TimelineItem =
  | { kind: 'evolution'; date: string; record: MedicalRecord }
  | { kind: 'referral'; date: string; referral: Referral };

/** Une evoluções e encaminhamentos num único histórico cronológico do paciente. */
export function usePatientTimeline(patientId: string | null) {
  const recordsQuery = useMedicalRecords(patientId);
  const referralsQuery = useReferrals(patientId);

  const records = useMemo(
    () => [...(recordsQuery.data?.data ?? [])].sort((a, b) => a.sessionNumber - b.sessionNumber),
    [recordsQuery.data],
  );
  const referrals = useMemo(() => referralsQuery.data?.data ?? [], [referralsQuery.data]);

  const timeline: TimelineItem[] = useMemo(() => {
    const evolutionItems: TimelineItem[] = records.map((record) => ({
      kind: 'evolution',
      date: record.createdAt,
      record,
    }));
    const referralItems: TimelineItem[] = referrals.map((referral) => ({
      kind: 'referral',
      date: referral.createdAt,
      referral,
    }));
    return [...evolutionItems, ...referralItems].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [records, referrals]);

  const nextSessionNumber = records.length > 0 ? records[records.length - 1].sessionNumber + 1 : 1;

  return {
    records,
    referrals,
    timeline,
    nextSessionNumber,
    isLoading: recordsQuery.isLoading || referralsQuery.isLoading,
  };
}
