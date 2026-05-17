import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useBudgetStore } from '@/stores/budgetStore';
import { formatRupiah } from '@/lib/utils';
import { CATEGORY_TYPE_COLORS } from '@/lib/constants';

export function ExpenseDonut() {
  const { transactions, categories } = useBudgetStore();

  // Group expenses by category
  const expenses = transactions.filter((t) => t.type === 'expense');
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, tx) => {
    const catId = tx.category_id;
    acc[catId] = (acc[catId] || 0) + Number(tx.amount);
    return acc;
  }, {});

  const chartData = Object.entries(categoryTotals)
    .map(([catId, total]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        name: cat?.name || 'Lainnya',
        value: total,
        color: cat?.color || CATEGORY_TYPE_COLORS.lainnya,
        icon: cat?.icon || '📦',
      };
    })
    .sort((a, b) => b.value - a.value);

  const totalExpense = chartData.reduce((sum, d) => sum + d.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '300ms' }}>
        <p className="text-3xl mb-2">📊</p>
        <p className="text-sm text-surface-400">Belum ada pengeluaran bulan ini</p>
        <p className="text-xs text-surface-500 mt-1">Mulai catat transaksimu!</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
      <h3 className="mb-3 text-sm font-semibold text-surface-300">
        Pengeluaran per Kategori
      </h3>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="h-36 w-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0];
                  return (
                    <div className="glass-card px-3 py-2 text-xs">
                      <p className="font-medium text-surface-200">{d.name}</p>
                      <p className="text-surface-400">{formatRupiah(d.value as number)}</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-2 overflow-hidden">
          {chartData.slice(0, 5).map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-xs text-surface-300">
                {item.icon} {item.name}
              </span>
              <span className="ml-auto text-xs font-medium tabular-nums text-surface-400">
                {totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0}%
              </span>
            </div>
          ))}
          {chartData.length > 5 && (
            <p className="text-xs text-surface-500">
              +{chartData.length - 5} kategori lainnya
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
