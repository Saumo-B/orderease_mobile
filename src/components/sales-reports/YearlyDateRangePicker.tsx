
'use client';

import * as React from 'react';
import {
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  format,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  isToday,
} from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface YearlyDateRangePickerProps {
  onDateChange: (range: DateRange | undefined) => void;
  initialRange?: DateRange;
}

export function YearlyDateRangePicker({ onDateChange, initialRange }: YearlyDateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(initialRange);
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);
  
  const yearContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setDate(initialRange);
    if (initialRange?.from && yearContainerRef.current) {
        const monthId = `month-${format(initialRange.from, 'yyyy-MM')}`;
        const monthElement = yearContainerRef.current.querySelector(`#${monthId}`);
        if(monthElement) {
            monthElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, [initialRange]);

  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 11, 31));
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  const handleDayClick = (day: Date) => {
    let newRange: DateRange | undefined;
    if (!date?.from || date.to) {
      newRange = { from: day, to: undefined };
    } else {
      newRange = { from: date.from, to: day };
      if (newRange.from && newRange.to && newRange.from > newRange.to) {
        newRange = { from: newRange.to, to: newRange.from };
      }
    }
    setDate(newRange);
    onDateChange(newRange);
  };

  const daysGroupedByMonth = allDays.reduce((acc, day) => {
    const month = format(day, 'MMMM yyyy');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(day);
    return acc;
  }, {} as Record<string, Date[]>);

  const isDayInRange = (day: Date) => {
    if (!date?.from || !date?.to) return false;
    return isWithinInterval(day, { start: date.from, end: date.to });
  };
  
  const isDayInHoverRange = (day: Date) => {
    if (!date?.from || date.to || !hoveredDate) return false;
    const start = date.from < hoveredDate ? date.from : hoveredDate;
    const end = date.from > hoveredDate ? date.from : hoveredDate;
    return isWithinInterval(day, { start, end });
  };
  
  const monthKeys = Object.keys(daysGroupedByMonth);

  return (
    <div>
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-end pb-2" ref={yearContainerRef}>
            {monthKeys.map((month, index) => (
                <React.Fragment key={month}>
                    <div id={`month-${format(daysGroupedByMonth[month][0], 'yyyy-MM')}`} className="flex flex-col items-center">
                        <div className="text-sm font-semibold text-cyan-400 mb-1 w-full text-center sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-1">
                            {format(daysGroupedByMonth[month][0], 'MMM')}
                        </div>
                        <div className="flex space-x-1">
                            {daysGroupedByMonth[month].map((day) => (
                            <div key={day.toString()} className="flex flex-col items-center gap-1">
                                <button
                                    onClick={() => handleDayClick(day)}
                                    onMouseEnter={() => setHoveredDate(day)}
                                    onMouseLeave={() => setHoveredDate(null)}
                                    className={cn(
                                    'h-6 w-6 rounded-full flex items-center justify-center transition-colors',
                                    'bg-cyan-500/30',
                                    isToday(day) && !isDayInRange(day) && 'border-2 border-cyan-400',
                                    (isSameDay(day, date?.from || new Date(0)) || isSameDay(day, date?.to || new Date(0)))
                                        ? 'bg-cyan-400 text-black'
                                        : isDayInRange(day)
                                        ? 'bg-cyan-500/20'
                                        : isDayInHoverRange(day)
                                        ? 'bg-cyan-500/10'
                                        : 'bg-background/50',
                                    )}
                                >
                                    <span className="text-[11px]">{format(day, 'd')}</span>
                                </button>
                                <span className="text-[8px] text-muted-foreground opacity-70">{format(day, 'E')[0]}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                    {index < monthKeys.length - 1 && <div className="text-muted-foreground mx-2">|</div>}
                </React.Fragment>
            ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
  );
}
