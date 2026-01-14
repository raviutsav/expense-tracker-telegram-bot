import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { format, subDays, startOfYear } from 'date-fns';

const DateRangePicker = ({ onChange, initialRange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [range, setRange] = useState(initialRange || {
        label: 'Last 30 days',
        start: subDays(new Date(), 30),
        end: new Date()
    });
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleQuickSelect = (label, days) => {
        const end = new Date();
        let start;

        if (label === 'Year to date') {
            start = startOfYear(new Date());
        } else if (label === 'Today') {
            start = new Date();
        } else {
            start = subDays(new Date(), days);
        }

        const newRange = { label, start, end };
        setRange(newRange);
        setIsOpen(false);
        onChange(newRange);
    };

    const handleCustomApply = () => {
        if (customStart && customEnd) {
            const start = new Date(customStart);
            const end = new Date(customEnd);
            const newRange = {
                label: `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`,
                start,
                end
            };
            setRange(newRange);
            setIsOpen(false);
            onChange(newRange);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-[240px] justify-start text-left font-normal border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
                    !range && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {range ? range.label : <span>Pick a date</span>}
                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>

            {isOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-border bg-popover p-4 shadow-lg animate-in fade-in-0 zoom-in-95 text-popover-foreground">
                    <div className="grid gap-2">
                        <h4 className="font-medium leading-none mb-2">Quick Select</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleQuickSelect('Today', 0)}>
                                Today
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleQuickSelect('Last 7 days', 7)}>
                                Last 7 days
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleQuickSelect('Last 30 days', 30)}>
                                Last 30 days
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleQuickSelect('Last 90 days', 90)}>
                                Last 90 days
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleQuickSelect('Year to date', 0)}>
                                Year to date
                            </Button>
                        </div>
                    </div>

                    <div className="my-4 border-t border-border" />

                    <div className="grid gap-2">
                        <h4 className="font-medium leading-none mb-2">Custom Range</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-1">
                                <label className="text-xs text-muted-foreground">Start</label>
                                <input
                                    type="date"
                                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                    onChange={(e) => setCustomStart(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-1">
                                <label className="text-xs text-muted-foreground">End</label>
                                <input
                                    type="date"
                                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button size="sm" className="mt-2" onClick={handleCustomApply}>
                            Apply Range
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
