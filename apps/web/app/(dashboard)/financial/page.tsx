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

type ScopeFilter = FinancialScope | 'ALL';

/** Módulo Financeiro Integrado (PRD 9.8). */
export default function FinancialPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('ALL');

  const transactionsQuery = useTransactions(year, month);
  const transactions = (transactionsQuery.data?.data ?? []).filter(
    (t) => scopeFilter === 'ALL' || t.scope === scopeFilter,
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
        <h1 className="text-xl font-bold text-slate-50">Financeiro</h1>
        <NewTransactionDialog />
      </div>

      <div className="card">
        <div className="grid grid-cols-3 divide-x divide-white/10">
          <div className="px-4 first:pl-0">
            <p className="text-xs text-slate-400">Receitas</p>
            <p className="text-xl font-bold text-status-success">{currency.format(income)}</p>
          </div>
          <div className="px-4">
            <p className="text-xs text-slate-400">Despesas</p>
            <p className="text-xl font-bold text-status-danger">{currency.format(expense)}</p>
          </div>
          <div className="px-4">
            <p className="text-xs text-slate-400">Saldo</p>
            <p className="text-xl font-bold text-slate-50">{currency.format(balance)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value as ScopeFilter)} className="w-40">
          <option value="ALL">Todas</option>
          <option value="OFFICE">Consultório</option>
          <option value="PERSONAL">Pessoal</option>
        </Select>
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
            <p className="text-sm text-slate-500">Nenhum lançamento neste período.</p>
          )}
          <div className="flex flex-col divide-y divide-white/5">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-200">{transaction.category}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(transaction.dueDate).toLocaleDateString('pt-BR')} ·{' '}
                    {transaction.scope === 'OFFICE' ? 'Consultório' : 'Pessoal'}
                    {transaction.recurring && ' · Recorrente'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={transaction.status === 'PAID' ? 'success' : 'warning'}>
                    {transaction.status === 'PAID' ? 'Pago' : 'Pendente'}
                  </Badge>
                  <span
                    className={
                      transaction.type === 'INCOME' ? 'font-semibold text-status-success' : 'font-semibold text-status-danger'
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
