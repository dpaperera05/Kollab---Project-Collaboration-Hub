import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimePickerProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  step?: number;
}

type Meridiem = "AM" | "PM";

const toTwoDigits = (num: number) => String(Math.max(0, num)).padStart(2, "0");

const to24Hour = (hour12: number, minute: number, meridiem: Meridiem) => {
  const safeHour = Math.min(12, Math.max(1, hour12));
  const safeMinute = Math.min(59, Math.max(0, minute));
  const hour24 = meridiem === "PM" ? (safeHour === 12 ? 12 : safeHour + 12) : safeHour === 12 ? 0 : safeHour;
  return `${toTwoDigits(hour24)}:${toTwoDigits(safeMinute)}`;
};

const parseTime = (value: string): { hour12: string; minute: string; meridiem: Meridiem } => {
  if (!value) return { hour12: "", minute: "", meridiem: "AM" };

  const trimmed = value.trim();
  const hasMeridiem = /am|pm/i.test(trimmed);

  if (hasMeridiem) {
    const [rawTime, rawMeridiem] = trimmed.split(/\s+/);
    const [h = "0", m = "0"] = rawTime.split(":");
    const meridiem = rawMeridiem?.toUpperCase() === "PM" ? "PM" : "AM";
    let hour = Number(h);
    if (Number.isNaN(hour)) hour = 0;
    if (meridiem === "PM" && hour < 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    const minute = Number(m) || 0;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return { hour12: toTwoDigits(displayHour), minute: toTwoDigits(minute), meridiem };
  }

  const [h = "0", m = "0"] = trimmed.split(":");
  const hour24 = Number(h) || 0;
  const minute = Number(m) || 0;
  const meridiem: Meridiem = hour24 >= 12 ? "PM" : "AM";
  const displayHour = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  return { hour12: toTwoDigits(displayHour), minute: toTwoDigits(minute), meridiem };
};

const TimePicker = ({ id, name, value, onChange, placeholder = "--:--", required, className, step = 60 }: TimePickerProps) => {
  const [open, setOpen] = useState(false);

  const parsed = useMemo(() => parseTime(value), [value]);
  const minuteStep = useMemo(() => Math.max(1, Math.round(step / 60)), [step]);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, idx) => toTwoDigits(idx + 1)), []);
  const minutes = useMemo(() => {
    const list: string[] = [];
    for (let m = 0; m < 60; m += minuteStep) {
      list.push(toTwoDigits(m));
    }
    if (!list.includes(parsed.minute)) {
      list.push(parsed.minute || "00");
      list.sort();
    }
    return list;
  }, [minuteStep, parsed.minute]);

  const displayValue = value ? `${parsed.hour12 || "--"}:${parsed.minute || "--"} ${parsed.meridiem}` : placeholder;

  const emitChange = (partial: Partial<{ hour12: string; minute: string; meridiem: Meridiem }>) => {
    const nextHour = partial.hour12 ?? parsed.hour12 ?? "12";
    const nextMinute = partial.minute ?? parsed.minute ?? "00";
    const nextMeridiem = partial.meridiem ?? parsed.meridiem;
    onChange(to24Hour(Number(nextHour), Number(nextMinute), nextMeridiem));
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              !value && "text-muted-foreground",
              className,
            )}
            aria-label="Select time"
            aria-required={required}
          >
            <span className="text-left">{displayValue}</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-3 p-3" align="start">
          <div className="text-xs text-muted-foreground">Select a time</div>
          <div className="grid grid-cols-3 gap-2">
            <Select value={parsed.hour12 || undefined} onValueChange={(val) => emitChange({ hour12: val })}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={parsed.minute || undefined} onValueChange={(val) => emitChange({ minute: val })}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {minutes.map((minute) => (
                  <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={parsed.meridiem} onValueChange={(val: Meridiem) => emitChange({ meridiem: val })}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
};

export default TimePicker;
