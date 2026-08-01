'use client';

import { Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimelineItem } from '@/lib/hooks/use-patient-timeline';

interface TimelineProps {
  items: TimelineItem[];
  onPrintReferral: (id: string) => void;
  emptyMessage?: string;
}

/** Histórico cronológico de evoluções e encaminhamentos de um paciente. */
export function Timeline({
  items,
  onPrintReferral,
  emptyMessage = 'Nenhuma evolução registrada ainda.',
}: TimelineProps) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-faint">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) =>
        item.kind === 'referral' ? (
          <Card key={`referral-${item.referral.id}`} className="border-accent-primary/30 bg-accent-soft/30">
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-ink">Encaminhamento — {item.referral.type}</h3>
                <span className="text-xs text-ink-faint">
                  {new Date(item.referral.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              {item.referral.recipient && (
                <p className="text-sm text-ink-muted">
                  <span className="font-medium text-ink-muted">Destinatário: </span>
                  {item.referral.recipient}
                </p>
              )}
              <p className="text-sm text-ink-muted">{item.referral.content}</p>
              <div className="mt-1">
                <Button variant="outline" size="sm" onClick={() => onPrintReferral(item.referral.id)}>
                  <Printer size={14} />
                  Abrir / Imprimir
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card key={item.record.id}>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-ink">Sessão nº {item.record.sessionNumber}</h3>
                <span className="text-xs text-ink-faint">
                  {new Date(item.record.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <p className="text-sm text-ink-muted">{item.record.evolutionText}</p>
              {item.record.observations && (
                <p className="text-sm text-ink-muted">
                  <span className="font-medium text-ink-muted">Observações: </span>
                  {item.record.observations}
                </p>
              )}
              {item.record.stepsText && (
                <p className="text-sm text-ink-muted">
                  <span className="font-medium text-ink-muted">Próximos passos: </span>
                  {item.record.stepsText}
                </p>
              )}
              {item.record.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.record.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-border px-2 py-0.5 text-xs text-ink-muted"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}
