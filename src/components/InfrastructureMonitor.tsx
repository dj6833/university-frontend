import React, { useEffect, useState, useRef } from "react";
import { BACKEND_BASE_URL, BACKEND_ANALYSIS_SERVICE_URL } from "@/constants";
import { infrastructureState } from "../lib/infrastructure";

interface ServiceState {
    id: string;
    name: string;
    status: "pending" | "loading" | "ready" | "failed";
    url: string;
}

const TOTAL_WARMUP_SECONDS = 15;
const POLLING_INTERVAL_MS = 4000;
const MAX_ATTEMPTS = Math.ceil((TOTAL_WARMUP_SECONDS * 1000) / POLLING_INTERVAL_MS);
const AUTO_CLOSE_DELAY_MS = 10000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const InfrastructureMonitor: React.FC = () => {
    const [isVisible, setIsVisible] = useState(infrastructureState.isVisible);
    const [shouldAutoClose, setShouldAutoClose] = useState(true);
    const [services, setServices] = useState<ServiceState[]>([]);
    const [globalSecondsRemaining, setGlobalSecondsRemaining] = useState(TOTAL_WARMUP_SECONDS);

    // 💡 PERSISTENT REF TRACKER: Holds our cancellation tokens across re-renders
    const abortControllerRef = useRef<AbortController | null>(null);

    const pollServiceStatus = async (id: string, url: string, signal: AbortSignal) => {
        let isLive = false;
        let currentAttempts = 0;

        while (!isLive && currentAttempts < MAX_ATTEMPTS) {
            // 💡 CANCELLATION GUARD: Immediately exit if user clicked close/hide
            if (signal.aborted) return;

            try {
                currentAttempts++;

                setServices((prev: ServiceState[]) =>
                    prev.map((s) => s.id === id ? { ...s, status: "loading" as const } : s)
                );

                const response = await fetch(url, {
                    method: "GET",
                    mode: "cors",
                    signal: signal // 💡 Attaches the cancellation token to the live browser handshake
                });

                if (response.status === 404) {
                    throw new Error("Target endpoint configuration pending");
                }

                if (response.ok) {
                    isLive = true;
                    setServices((prev: ServiceState[]) =>
                        prev.map((s) => s.id === id ? { ...s, status: "ready" as const } : s)
                    );
                    break;
                }
            } catch (err) {
                // If the error was an intentional cancellation abort call, drop out of loop entirely
                if (err instanceof Error && err.name === "AbortError") {
                    console.log(`[Monitor] Connection loop for service ${id} stopped cleanly.`);
                    return;
                }
            }

            if (!isLive) {
                if (currentAttempts >= MAX_ATTEMPTS) {
                    setServices((prev: ServiceState[]) => prev.map((s) => s.id === id ? { ...s, status: "failed" as const } : s));
                    break;
                }

                // Double check before sleeping to avoid dead time delays
                if (signal.aborted) return;
                await sleep(POLLING_INTERVAL_MS);
            }
        }
    };

    useEffect(() => {
        const basePrimaryWebServiceUrl = BACKEND_BASE_URL;
        const baseAnalysisEngineUrl = BACKEND_ANALYSIS_SERVICE_URL;

        const handleStateChange = (visible: boolean, triggerSource: "automated" | "manual") => {
            setIsVisible(visible);

            if (triggerSource === "manual") {
                setShouldAutoClose(false);
            }

            if (visible) {
                // 💡 INITIALIZE CANCELLATION ENGINE: Wipes out any old tokens and creates a fresh track
                if (abortControllerRef.current) abortControllerRef.current.abort();
                abortControllerRef.current = new AbortController();
                const currentSignal = abortControllerRef.current.signal;

                setGlobalSecondsRemaining(TOTAL_WARMUP_SECONDS);
                const initialServices: ServiceState[] = [
                    { id: "1", name: "Primary Web Service", status: "loading", url: `${basePrimaryWebServiceUrl}health/warmup/primary-webservice` },
                    { id: "2", name: "Database Service", status: "loading", url: `${basePrimaryWebServiceUrl}health/warmup/database` },
                    { id: "3", name: "Analysis Engine", status: "loading", url: `${baseAnalysisEngineUrl}warmup` }
                ];

                setServices(initialServices);
                initialServices.forEach((service) => {
                    pollServiceStatus(service.id, service.url, currentSignal);
                });
            }
        };

        const unsubscribe = infrastructureState.subscribe(handleStateChange);
        // 💡 THE FIX: Remove the abort logic from here!
        return () => {
            unsubscribe(); // Only detach the global message listener
        };
    }, []);

    // Smooth 1-second UI countdown timer for the unified clock
    useEffect(() => {
        if (!isVisible || services.length === 0) return;

        const uiInterval = setInterval(() => {
            // 💡 FIX: Check if all services are ready. If they are, turn off the clock.
            const allReady = services.every((s) => s.status === "ready");
            if (allReady) {
                clearInterval(uiInterval);
                return;
            }

            setGlobalSecondsRemaining((prevSeconds) => {
                const nextSeconds = prevSeconds - 1;

                if (nextSeconds <= 0) {
                    setShouldAutoClose(false);
                    // Force any remaining loading services to failed status on zero clock
                    setServices((prevServices) =>
                        prevServices.map((s) => s.status === "loading" ? { ...s, status: "failed" as const } : s)
                    );
                    clearInterval(uiInterval);
                    return 0;
                }
                return nextSeconds;
            });
        }, 1000);

        return () => clearInterval(uiInterval);
    }, [isVisible, services.map(s => s.status).join(",")]); // 💡 Watches status changes to toggle clock updates safely

    // Independent Lifecycle Watcher for Automated Dismissals
    useEffect(() => {
        if (services.length === 0 || !shouldAutoClose) return;

        const allReady = services.every((s) => s.status === "ready");

        if (allReady) {
            console.log("Monitor: Happy path complete. Dismissing window in 2 seconds...");
            const timeout = setTimeout(() => {
                infrastructureState.closeCheck();
                setServices([]);
            }, AUTO_CLOSE_DELAY_MS);

            return () => clearTimeout(timeout);
        }
    }, [services.map(s => s.status).join(","), shouldAutoClose]);

    const handleRetryAllFailed = () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        const currentSignal = abortControllerRef.current.signal;

        setGlobalSecondsRemaining(TOTAL_WARMUP_SECONDS);
        setServices((prev) =>
            prev.map((s) => s.status === "failed" ? { ...s, status: "loading" as const } : s)
        );

        services.forEach((service) => {
            if (service.status === "failed") {
                pollServiceStatus(service.id, service.url, currentSignal);
            }
        });
    };

    const handleManualHide = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        infrastructureState.closeCheck();
        setServices([]);
        setShouldAutoClose(true);
    };

    if (!isVisible) return null;

    const hasAnyFailed = services.some((s) => s.status === "failed");
    const isAllReady = services.length > 0 && services.every((s) => s.status === "ready");

    // Compute singular global timeline fill percentage against your constant
    const globalPercentComplete = ((TOTAL_WARMUP_SECONDS - globalSecondsRemaining) / TOTAL_WARMUP_SECONDS) * 100;

    return (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-32px)] sm:w-[380px] p-5 bg-popover text-popover-foreground rounded-xl border border-border font-mono shadow-2xl shadow-black/20 dark:shadow-black/50 box-border">

            <div className="flex justify-between items-start border-b border-border pb-2 mb-3">
                <h3 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                    System Environment Check
                </h3>

                <button
                    onClick={handleManualHide}
                    aria-label="Hide and stop diagnostics"
                    className="flex items-center justify-center bg-transparent border-none text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md cursor-pointer transition-all duration-200"
                >
                    <svg xmlns="http://w3.org" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <p className="text-[11px] text-muted-foreground m-0 mb-4 leading-relaxed">
                This project runs on services that automatically spin down during inactivity to save resources. Please be patient while we check they are awake, this usually takes under one minute.
            </p>


            <ul className="list-none p-0 m-0 mb-5">
                {services.map((service) => (
                    <li key={service.id} className="flex items-center justify-between my-2.5 text-sm">
                        <span className="text-popover-foreground/90">{service.name}</span>
                        <span className={`font-bold ${
                            service.status === "ready" ? "text-emerald-500" : service.status === "failed" ? "text-destructive" : "text-amber-500"
                        }`}>
                            {service.status === "ready" && "[ONLINE]"}
                            {service.status === "failed" && "[TIMEOUT]"}
                            {service.status === "loading" && "[WAKING UP]"}
                        </span>
                    </li>
                ))}
            </ul>

            {/* Global Timeline Progress Meter */}
            {!isAllReady && (
                <div className="mb-4 w-full">
                    <div className="w-full h-1 bg-muted rounded overflow-hidden">
                        <div
                            className={`h-1 transition-all duration-1000 ease-linear ${
                                hasAnyFailed ? "bg-destructive" : "bg-amber-500"
                            }`}
                            style={{ width: `${hasAnyFailed ? 100 : globalPercentComplete}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="border-t border-border pt-3 text-center">
                {isAllReady && (
                    <p className="text-xs font-semibold text-emerald-500 m-0">
                        All systems nominal. Environment ready.
                    </p>
                )}

                {!hasAnyFailed && !isAllReady && (
                    <p className="text-xs text-muted-foreground m-0">
                        Checking services... {globalSecondsRemaining}s remaining
                    </p>
                )}


                {hasAnyFailed && (
                    <div className="flex flex-col gap-2.5 items-center">
                        {/* 💡 UPDATED: Short, snappy text alerting the user about the impact */}
                        <p className="text-xs text-destructive font-medium m-0 leading-relaxed">
                            Some services took too long to respond. This may cause system issues.
                        </p>
                        <button
                            onClick={handleRetryAllFailed}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors border-none cursor-pointer text-xs p-2 rounded-md font-bold font-mono w-full shadow-md"
                        >
                            Retry Failed Services
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
