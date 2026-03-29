import type { LoanTypePoint } from "../dataService";

interface TooltipPayloadItem {
  payload?: LoanTypePoint;
}

interface LoanTypeAmountTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
};

const formatLoanAmountThousands = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  const dollars = value * 1000;
  const absolute = Math.abs(dollars);

  if (absolute >= 1_000_000_000_000) {
    return `$${(dollars / 1_000_000_000_000).toFixed(1)}T`;
  }

  if (absolute >= 1_000_000_000) {
    return `$${(dollars / 1_000_000_000).toFixed(1)}B`;
  }

  if (absolute >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(1)}M`;
  }

  return `$${Math.round(dollars).toLocaleString("en-US")}`;
};

export function LoanTypeAmountTooltip({ active, payload, label }: LoanTypeAmountTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  const hasAmounts = point.conventionalAmountThousands !== null && point.conventionalAmountThousands !== undefined;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white/95 px-4 py-3 text-sm shadow-[var(--shadow-soft)]">
      <p className="font-semibold text-[var(--color-ink)]">Year: {label}</p>

      <div className="mt-3 space-y-1 text-[var(--color-ink)]">
        <p>Conventional share: {formatPercent(point.conventional)}</p>
        <p>Government-backed share: {formatPercent(point.govtBacked)}</p>
      </div>

      {hasAmounts ? (
        <div className="mt-3 border-t border-[var(--color-border)] pt-3 text-[var(--color-ink)]">
          <p className="font-medium">Originated loan amount</p>
          <div className="mt-2 space-y-1">
            <p>
              Conventional: {formatLoanAmountThousands(point.conventionalAmountThousands)}
              {point.conventionalAmountShare !== null && point.conventionalAmountShare !== undefined
                ? ` (${formatPercent(point.conventionalAmountShare)} of dollars)`
                : ""}
            </p>
            <p>
              Government-backed: {formatLoanAmountThousands(point.govtBackedAmountThousands)}
              {point.govtBackedAmountShare !== null && point.govtBackedAmountShare !== undefined
                ? ` (${formatPercent(point.govtBackedAmountShare)} of dollars)`
                : ""}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
