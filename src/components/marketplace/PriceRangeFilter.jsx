import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { formatIDR } from '@/lib/format';

// Two-thumb price range slider. `value` is [min, max].
export default function PriceRangeFilter({ min, max, value, onChange }) {
  if (!max || max <= min) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{formatIDR(value[0])}</span>
        <span className="text-muted-foreground text-[0.65rem]">s/d · to</span>
        <span className="font-medium text-foreground">{formatIDR(value[1])}</span>
      </div>
      <SliderPrimitive.Root
        value={value}
        min={min}
        max={max}
        step={1000}
        onValueChange={onChange}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-[0.65rem] text-muted-foreground/70">
        <span>{formatIDR(min)}</span>
        <span>{formatIDR(max)}</span>
      </div>
    </div>
  );
}