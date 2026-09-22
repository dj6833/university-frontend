import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export const GlobalScreenBlocker = () => {
    const isFetching = useIsFetching();
    const isMutating = useIsMutating();
    const [isLocked, setIsLocked] = useState(false);

    // Lock the screen if ANY page data is reloading or a form is saving
    const isBusy = isFetching > 0 || isMutating > 0;

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isBusy) {
            // 150ms delay keeps fast local cache movements feeling snappy
            timer = setTimeout(() => setIsLocked(true), 150);
        } else {
            setIsLocked(false);
        }
        return () => clearTimeout(timer);
    }, [isBusy]);

    if (!isLocked) return null;

    return (
        <div
            className="fixed top-16 right-0 bottom-0 left-0 md:left-64 z-50 flex flex-col items-center justify-center bg-background/10 backdrop-blur-[1px] transition-all pointer-events-auto select-none cursor-wait"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <div className="flex items-center gap-2.5 rounded-full bg-foreground px-5 py-2.5 text-background shadow-xl border border-background/10 animate-in zoom-in-95 duration-200">
                <Loader2 className="h-4 w-4 animate-spin text-background" />
                <span className="text-xs font-bold tracking-tight">Loading...</span>
            </div>
        </div>
    );
};
