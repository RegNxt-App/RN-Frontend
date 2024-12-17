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
  isValidDate?: (date: Date) => boolean;
}

export function DatePicker({
  value,
  onChange,
  className,
  isValidDate,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? parse(value, "yyyy-MM-dd", new Date()) : undefined
  );

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate && isValid(newDate)) {
      onChange(format(newDate, "yyyy-MM-dd"));
    } else {
      onChange(null);
    }
  };

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
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            disabled={isValidDate ? (date) => !isValidDate(date) : undefined}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
