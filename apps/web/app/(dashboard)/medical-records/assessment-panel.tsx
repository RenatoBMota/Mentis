'use client';

import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { designTokens } from '@/lib/design-tokens';
import { ASSESSMENT_LABELS, ASSESSMENT_MAX_SCORE, AssessmentType } from '@/lib/assessments';
import { Assessment } from '@/lib/types';
import { useAssessments } from '@/lib/hooks/use-assessments';
import { NewAssessmentDialog } from './new-assessment-dialog';

interface AssessmentPanelProps {
  patientId: string;
}

const TYPES: AssessmentType[] = ['PHQ9', 'GAD7', 'EPDS', 'SRQ20', 'AUDIT', 'PSS10', 'WHO5'];

const TONE_CLASSES: Record<Assessment['severityTone'], string> = {
  success: 'bg-status-success-soft text-status-success',
  warning: 'bg-status-warning-soft text-status-warning',
  danger: 'bg-status-danger-soft text-status-danger',
};

export function AssessmentPanel({ patientId }: AssessmentPanelProps) {
  const assessmentsQuery = useAssessments(patientId);
  const assessments = useMemo(() => assessmentsQuery.data?.data ?? [], [assessmentsQuery.data]);

  const byType = useMemo(() => {
    const map = new Map<AssessmentType, Assessment[]>();
    for (const type of TYPES) {
      map.set(
        type,
        assessments
          .filter((a) => a.type === type)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      );
    }
    return map;
  }, [assessments]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Avaliações Psicológicas</CardTitle>
          <NewAssessmentDialog patientId={patientId} />
        </div>
      </CardHeader>
      <CardContent>
        {assessmentsQuery.isLoading && <div className="skeleton h-24" />}

        {!assessmentsQuery.isLoading && assessments.length === 0 && (
          <p className="text-sm text-ink-faint">Nenhuma avaliação aplicada ainda.</p>
        )}

        {!assessmentsQuery.isLoading && assessments.length > 0 && (
          <div className="flex flex-col gap-6">
            {TYPES.map((type) => {
              const items = byType.get(type) ?? [];
              if (items.length === 0) return null;
              return (
                <div key={type} className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-ink">{ASSESSMENT_LABELS[type]}</p>

                  {items.length >= 2 && (
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={items} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke={designTokens.border} strokeDasharray="3 3" />
                        <XAxis
                          dataKey="createdAt"
                          tickFormatter={(v: string) =>
                            new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                          }
                          tick={{ fontSize: 10, fill: designTokens.ink.faint }}
                          axisLine={{ stroke: designTokens.border }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, ASSESSMENT_MAX_SCORE[type]]}
                          tick={{ fontSize: 10, fill: designTokens.ink.faint }}
                          axisLine={false}
                          tickLine={false}
                          width={28}
                        />
                        <Tooltip
                          formatter={(value: number) => [value, 'Pontuação']}
                          labelFormatter={(label: string) => new Date(label).toLocaleDateString('pt-BR')}
                          contentStyle={{
                            background: designTokens.surface.base,
                            border: `1px solid ${designTokens.border}`,
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="totalScore"
                          stroke={designTokens.accent.primary}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  <div className="flex flex-col divide-y divide-border">
                    {[...items].reverse().map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-ink-faint">
                          {new Date(assessment.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <div className="flex items-center gap-2">
                          {assessment.clinicalAlert && (
                            <span
                              className="flex items-center gap-1 rounded-full bg-status-danger-soft px-2 py-0.5 text-xs font-medium text-status-danger"
                              title="Item de alerta clínico (ideação suicida/autolesão) com pontuação > 0"
                            >
                              <AlertTriangle size={12} />
                              Atenção
                            </span>
                          )}
                          <span className="font-medium text-ink">
                            {assessment.totalScore}/{ASSESSMENT_MAX_SCORE[type]}
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-medium',
                              TONE_CLASSES[assessment.severityTone],
                            )}
                          >
                            {assessment.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
