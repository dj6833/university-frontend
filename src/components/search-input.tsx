import React, { useEffect, useState } from "react";
import {Input} from "@/components/ui/input.tsx";

const delaySearchMs = 1000; //milliseconds to wait for further keypresses before applying the filter

// Strictly locks this component down only to TEXT inputs
interface SearchInputProps extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "type"> {
    value: string; // Must be a string (doesn't apply to files, numbers, checkboxes..)
    onDebouncedChange: (value: string) => void;
    delay?: number;
    type?: "text" | "search" | "tel" | "url" | "email"; // Explicitly lists text-safe input formats
}

export const SearchInput = ({
                                value: controlledValue,
                                onDebouncedChange,
                                delay = delaySearchMs,
                                type = "text", // Defaults safely to text
                                ...props
                            }: SearchInputProps) => {
    const [localValue, setLocalValue] = useState(controlledValue);

    // Sync state if an external clear button triggers or the page resets
    useEffect(() => {
        setLocalValue(controlledValue);
    }, [controlledValue]);

    // Handle the text input delay buffer
    useEffect(() => {
        const timer = setTimeout(() => {
            onDebouncedChange(localValue);
        }, delay);

        return () => clearTimeout(timer);
    }, [localValue, delay, onDebouncedChange]);

    return (
        <Input
            {...props}
            type={type}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)} // Fast, local typing
        />
    );
};
