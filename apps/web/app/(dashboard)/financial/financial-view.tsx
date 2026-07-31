'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTransactions } from '@/lib/hooks/use-financial';
import { FinancialScope } from '@/lib/types';
import { NewTransactionDialog } from './new-transaction-dialog';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface FinancialViewProps {
  scope: FinancialScope;
  title: string;
  subtitle: string;
}

/** Módulo Financeiro Integrado (PRD 9.8), dividido por escopo Consultório/Pessoal. */
export function FinancialView({ scope, title, subtitle }: FinancialViewProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const transactionsQuery = useTransactions(year, month);
  const transactions = useMemo(
    () => (transactionsQuery.data?.data ?? []).filter((t) => t.scope === scope),
    [transactionsQuery.data, scope],
  );

  const { income, expense, balance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">{title}</h1>
          <p className="text-sm text-ink-muted">{subtitle}</p>
        </div>
        <NewTransactionDialog scope={scope} />
      </div>

      <div className="card">
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="px-4 first:pl-0">
            <p className="text-xs text-ink-muted">Receitas</p>
            <p className="font-serif text-xl font-medium text-status-success">{currency.format(income)}</p>
          </div>
          <div className="px-4">
            <p className="text-xs text-ink-muted">Despesas</p>
            <p className="font-serif text-xl font-medium text-status-danger">{currency.format(expense)}</p>
          </div>
          <div className="px-4">
            <p className="text-xs text-ink-muted">Saldo</p>
            <p className="font-serif text-xl font-medium text-ink">{currency.format(balance)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-40">
          {MONTHS.map((label, i) => (
            <option key={label} value={i + 1}>
              {label}
            </option>
          ))}
        </Select>
        <Select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-28">
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lançamentos do período</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsQuery.isLoading && <div className="skeleton h-24" />}
          {!transactionsQuery.isLoading && transactions.length === 0 && (
            <p className="text-sm text-ink-faint">Nenhum lançamento neste período.</p>
          )}
          <div className="flex flex-col divide-y divide-border">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{transaction.category}</p>
                  <p className="text-xs text-ink-faint">
                    {new Date(transaction.dueDate).toLocaleDateString('pt-BR')}
                    {transaction.recurring && ' · Recorrente'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={transaction.status === 'PAID' ? 'success' : 'warning'}>
                    {transaction.status === 'PAID' ? 'Pago' : 'Pendente'}
                  </Badge>
                  <span
                    className={
                      transaction.type === 'INCOME'
                        ? 'font-semibold text-status-success'
                        : 'font-semibold text-status-danger'
                    }
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {currency.format(Number(transaction.amount))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
