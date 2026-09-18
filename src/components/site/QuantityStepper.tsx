import { Minus, Plus } from "lucide-react";

import { MAX_QUANTITY } from "@/lib/cart-context";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  label?: string | undefined;
}

export function QuantityStepper({ value, onChange, label = "Quantity" }: QuantityStepperProps) {
  return (
    <div
      className="inline-flex items-center rounded-full border border-input"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
