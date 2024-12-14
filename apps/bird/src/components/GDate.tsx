"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

interface DatePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  isValidDate?: (date: Date) => boolean;
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
  className,
}: DatePickerProps) {
  const parseDate = (dateString: string | null): Date | undefined => {
    if (!dateString) return undefined;

    // Try parsing with different formats
    const formats = [
      "yyyy-MM-dd",
      "yyyy-MM-dd'T'HH:mm:ss",
      "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
    ];
    for (const format of formats) {
      const parsedDate = parse(dateString, format, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }

    return undefined;
  };

  const [date, setDate] = React.useState<Date | undefined>(parseDate(value));

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && isValid(newDate)) {
      onChange(format(newDate, "yyyy-MM-dd"));
    } else {
      onChange(null);
    }
  };

  const displayValue = React.useMemo(() => {
    if (date && isValid(date)) {
      return format(date, "PPP");
    }
    if (value) {
      return `Invalid date: ${value}`;
    }
    return "Pick a date";
  }, [date, value]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            disabled={disabled}
            selected={date}
            onSelect={handleDateChange}
            // disabled={isValidDate ? (date) => !isValidDate(date) : undefined}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
