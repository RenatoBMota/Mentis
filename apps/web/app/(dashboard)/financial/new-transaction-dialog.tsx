'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useCreateTransaction } from '@/lib/hooks/use-financial';
import { FinancialScope, FinancialTransactionType } from '@/lib/types';

export function NewTransactionDialog({ scope }: { scope: FinancialScope }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FinancialTransactionType>('EXPENSE');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTransaction = useCreateTransaction();

  function resetForm() {
    setType('EXPENSE');
    setCategory('');
    setAmount('');
    setDueDate('');
    setRecurring(false);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createTransaction.mutateAsync({
        type,
        scope,
        category,
        amount: Number(amount),
        dueDate,
        recurring,
      });
      resetForm();
      setOpen(false);
    } catch {
      setError('Não foi possível salvar o lançamento. Tente novamente.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          Novo lançamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo lançamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">Tipo</Label>
            <Select id="type" value={type} onChange={(e) => setType(e.target.value as FinancialTransactionType)}>
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              required
              placeholder="Ex.: Aluguel da sala"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate">Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-border bg-surface-base accent-accent-primary"
            />
            Lançamento recorrente (repete todo mês)
          </label>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <Button type="submit" disabled={createTransaction.isPending} className="mt-2">
            {createTransaction.isPending ? 'Salvando…' : 'Salvar lançamento'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
