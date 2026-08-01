'use client';

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendPoint } from '@/lib/hooks/use-dashboard';
import { designTokens } from '@/lib/design-tokens';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function formatDayTick(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

function formatDayLong(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

interface RevenueTrendChartProps {
  data: TrendPoint[];
  loading?: boolean;
}

export function RevenueTrendChart({ data, loading }: RevenueTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento — últimos {data.length || 30} dias</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="skeleton h-52" />
        ) : (
          <ResponsiveContainer width="100%" height={208}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={designTokens.accent.primary} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={designTokens.accent.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={designTokens.border} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDayTick}
                interval="preserveStartEnd"
                tick={{ fontSize: 11, fill: designTokens.ink.faint }}
                axisLine={{ stroke: designTokens.border }}
                tickLine={false}
                minTickGap={32}
              />
              <YAxis
                tickFormatter={(v) => currency.format(v)}
                tick={{ fontSize: 11, fill: designTokens.ink.faint }}
                axisLine={false}
                tickLine={false}
                width={64}
              />
              <Tooltip
                formatter={(value: number) => [currency.format(value), 'Receita']}
                labelFormatter={(label: string) => formatDayLong(label)}
                contentStyle={{
                  background: designTokens.surface.base,
                  border: `1px solid ${designTokens.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={designTokens.accent.primary}
                strokeWidth={2}
                fill="url(#revenueFill)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

interface AttendanceTrendChartProps {
  data: TrendPoint[];
  loading?: boolean;
}

export function AttendanceTrendChart({ data, loading }: AttendanceTrendChartProps) {
  const series = data.map((point) => ({
    date: point.date,
    rate: point.scheduled > 0 ? Math.round((point.completed / point.scheduled) * 100) : null,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparecimento — últimos {data.length || 30} dias</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="skeleton h-52" />
        ) : (
          <ResponsiveContainer width="100%" height={208}>
            <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={designTokens.border} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDayTick}
                interval="preserveStartEnd"
                tick={{ fontSize: 11, fill: designTokens.ink.faint }}
                axisLine={{ stroke: designTokens.border }}
                tickLine={false}
                minTickGap={32}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: designTokens.ink.faint }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value: unknown) => [
                  value === null ? 'Sem sessões' : `${value}%`,
                  'Comparecimento',
                ]}
                labelFormatter={(label: string) => formatDayLong(label)}
                contentStyle={{
                  background: designTokens.surface.base,
                  border: `1px solid ${designTokens.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={designTokens.accent.strong}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
