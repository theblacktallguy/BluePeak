type Props = {
  amount: number;
};

export default function SpendingSummary({ amount }: Props) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">
        Insights
      </h2>

      <div className="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-600">This month spending</p>

        <p className="mt-1 text-xl font-semibold text-slate-900">
          ${amount.toLocaleString()}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Total debit transactions for the current month
        </p>
      </div>
    </section>
  );
}