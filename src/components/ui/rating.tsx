"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string | number;
  defaultValue?: string | number;
  max?: number;
  precision?: number;
  readOnly?: boolean;
  onRatingChange?: (value: number) => void;
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      defaultValue = 0,
      max = 5,
      precision = 1,
      readOnly = false,
     // onChange,
      onRatingChange,
      className,
      ...props
    },
    ref
  ) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const [internalValue, setInternalValue] = React.useState<number>(
      Number(defaultValue)
    );

    const roundToNearest = (num: number) => {
      const inverse = 1 / precision;
      return Math.round(num * inverse) / inverse;
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
      if (readOnly) return;

      const { left, width } = event.currentTarget.getBoundingClientRect();
      const percent = (event.clientX - left) / width;
      const newValue = roundToNearest(percent * max);
      setHoverValue(Math.max(0, Math.min(max, newValue)));
    };

    const handleMouseLeave = () => {
      setHoverValue(null);
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (readOnly) return;

      const { left, width } = event.currentTarget.getBoundingClientRect();
      const percent = (event.clientX - left) / width;
      const newValue = roundToNearest(percent * max);
      const clampedValue = Math.max(0, Math.min(max, newValue));

      setInternalValue(clampedValue);
      onRatingChange?.(clampedValue);
    };

    const displayValue = hoverValue ?? Number(value ?? internalValue);

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex gap-1",
          readOnly ? "pointer-events-none" : "cursor-pointer",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...props}
      >
        {Array.from({ length: max }).map((_, index) => {
          const filled = index + 1 <= displayValue;
          const partiallyFilled =
            index < displayValue && displayValue < index + 1;
          const fillPercentage = partiallyFilled
            ? (displayValue - index) * 100
            : 0;

          return (
            <div key={index} className="relative">
              <Star
                className={cn(
                  "h-5 w-5",
                  filled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                )}
              />
              {partiallyFilled && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

Rating.displayName = "Rating";

export { Rating };
