import React, { useEffect, useState, useRef } from "react";
import { BACKEND_BASE_URL, BACKEND_ANALYSIS_SERVICE_URL } from "@/constants";
import { infrastructureState } from "../lib/infrastructure";

interface ServiceState {
    id: string;
    name: string;
    status: "pending" | "loading" | "ready" | "failed";
    url: string;
}

const WARMUP_OVERALL_TIMEOUT_SECONDS = 70;
const WARMUP_REQUEST_POLLING_INTERVAL_MS = 4000;
const WARMUP_MAX_POLLING_ATTEMPTS = Math.ceil((WARMUP_OVERALL_TIMEOUT_SECONDS * 1000) / WARMUP_REQUEST_POLLING_INTERVAL_MS);
const HEALTH_WIDGET_AUTO_CLOSE_DELAY_MS = 3000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const InfrastructureMonitor: React.FC = () => {
    const [isVisible, setIsVisible] = useState(infrastructureState.isVisible);
    const [shouldAutoClose, setShouldAutoClose] = useState(!infrastructureState.isSticky);
    const [services, setServices] = useState<ServiceState[]>([]);
    const [globalSecondsRemaining, setGlobalSecondsRemaining] = useState(WARMUP_OVERALL_TIMEOUT_SECONDS);

    const abortControllerRef = useRef<AbortController | null>(null);
    const isTimedOutRef = useRef(false);

    const pollServiceStatus = async (id: string, url: string, signal: AbortSignal) => {
        let isLive = false;
        let currentAttempts = 0;

        while (!isLive && currentAttempts < WARMUP_MAX_POLLING_ATTEMPTS) {
            if (signal.aborted || isTimedOutRef.current) return; // Instantly drop out if user closed it, or if the clock hit zero
            try {
                currentAttempts++;

                setServices((prev: ServiceState[]) => {
                    const match = prev.find((s) => s.id === id);
                    if (match && match.status === "failed") return prev;
                    return prev.map((s) => s.id === id ? { ...s, status: "loading" as const } : s);
                });

                const response = await fetch(url, { method: "GET", mode: "cors", signal });

                if (response.status === 404) {
                    throw new Error("Target endpoint pending");
                }

                if (response.ok) {
                    isLive = true;
                    setServices((prev: ServiceState[]) =>
                        prev.map((s) => s.id === id ? { ...s, status: "ready" as const } : s)
                    );
                    break;
                }
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;
            }

            if (!isLive) {
                if (currentAttempts >= WARMUP_MAX_POLLING_ATTEMPTS || isTimedOutRef.current) {
                    setServices((prev: ServiceState[]) => prev.map((s) => s.id === id ? { ...s, status: "failed" as const } : s));
                    break;
                }

                if (signal.aborted || isTimedOutRef.current) return;
                await sleep(WARMUP_REQUEST_POLLING_INTERVAL_MS);
            }
        }
    };

    const startWarmupSequence = () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        const currentSignal = abortControllerRef.current.signal;

        isTimedOutRef.current = false;
        setGlobalSecondsRemaining(WARMUP_OVERALL_TIMEOUT_SECONDS);

        const initialServices: ServiceState[] = [
            { id: "1", name: "Primary Web Service", status: "loading", url: `${BACKEND_BASE_URL}health/warmup/primary-webservice` },
            { id: "2", name: "Database Service", status: "loading", url: `${BACKEND_BASE_URL}health/warmup/database` },
            { id: "3", name: "Analysis Engine", status: "loading", url: `${BACKEND_ANALYSIS_SERVICE_URL}warmup` }
        ];

        setServices(initialServices);
        initialServices.forEach((service) => {
            pollServiceStatus(service.id, service.url, currentSignal);
        });
    };

    useEffect(() => {
        const handleStateChange = (visible: boolean, forceSticky: boolean) => {
            setIsVisible(visible);
            setShouldAutoClose(!forceSticky);

            // Fires warmups when the grid transitions to view
            if (visible) {
                startWarmupSequence();
            }
        };

        const unsubscribe = infrastructureState.subscribe(handleStateChange);

        // Fire once on initial web application layout mount boot
        if (infrastructureState.isVisible) {
            startWarmupSequence();
        }

        return () => {
            unsubscribe();
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, []);

    useEffect(() => {
        if (!isVisible || services.length === 0) return;

        const uiInterval = setInterval(() => {
            const allReady = services.every((s) => s.status === "ready");
            if (allReady) {
                clearInterval(uiInterval);
                return;
            }

            setGlobalSecondsRemaining((prevSeconds) => {
                const nextSeconds = prevSeconds - 1;

                if (nextSeconds <= 0) {
                    clearInterval(uiInterval);
                    setShouldAutoClose(false);

                    // all background network loops to self-destruct immediately
                    isTimedOutRef.current = true;

                    setServices((prevServices) =>
                        prevServices.map((s) => s.status === "loading" ? { ...s, status: "failed" as const } : s)
                    );
                    return 0;
                }
                return nextSeconds;
            });
        }, 1000); //runs every second for smooth UI effect

        return () => clearInterval(uiInterval);
    }, [isVisible, services.map(s => s.status).join(",")]);

    // Independent Lifecycle Watcher for Automated Dismissals
    useEffect(() => {
        if (services.length === 0 || !isVisible || !shouldAutoClose) return;

        const allReady = services.every((s) => s.status === "ready");

        if (allReady) {
            const timeout = setTimeout(() => {
                infrastructureState.closeCheck();
            }, HEALTH_WIDGET_AUTO_CLOSE_DELAY_MS);

            return () => clearTimeout(timeout);
        }
    }, [services.map(s => s.status).join(","), isVisible, shouldAutoClose]);

    const handleManualHide = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        sessionStorage.setItem("infra_has_seen_monitor", "true");
        sessionStorage.setItem("infra_session_greeted", "true");
        infrastructureState.closeCheck();
    };

    const handleManualOpen = () => {
        infrastructureState.openCheck(true);
    };

    const hasAnyFailed = services.some((s) => s.status === "failed");
    const isAllReady = services.length > 0 && services.every((s) => s.status === "ready");

    const secondsElapsed = WARMUP_OVERALL_TIMEOUT_SECONDS - globalSecondsRemaining;
    const globalPercentComplete = Math.min((secondsElapsed / WARMUP_OVERALL_TIMEOUT_SECONDS) * 100, 100);

    if (!isVisible) {
        return (
            <button
                onClick={handleManualOpen}
                aria-label="Open environment system status dashboard"
                className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-popover/90 text-popover-foreground hover:bg-muted/90 text-xs font-mono font-bold rounded-full border border-border/80 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group backdrop-blur-xs select-none"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary group-hover:scale-110 transition-transform duration-300"
                >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>

                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                    Health
                </span>
            </button>
        );
    }


    return (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-32px)] sm:w-[380px] p-5 bg-popover text-popover-foreground rounded-xl border border-border font-mono shadow-2xl shadow-black/20 dark:shadow-black/50 box-border">
            <div className="flex justify-between items-start border-b border-border pb-2 mb-3">
                <h3 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                    System Health Check
                </h3>
                <button
                    onClick={handleManualHide}
                    aria-label="Hide panel diagnostics"
                    className="flex items-center justify-center bg-transparent border-none text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md cursor-pointer transition-all duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <p className="text-[11px] text-muted-foreground m-0 mb-4 leading-relaxed">
                Thanks for visiting this project site. It runs on services that sleep during inactivity to save resources, so we periodically check they are awake for you. Please be patient, this can take up to a minute.
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
                    <div className="flex flex-col gap-2.5 items-center">
                        <p className="text-xs font-semibold text-emerald-500 m-0">
                            All services operational
                        </p>
                        <button
                            onClick={handleManualHide}
                            className="bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors border-none cursor-pointer text-xs p-2 rounded-md font-bold font-mono w-full shadow-md"
                        >
                            Close Window
                        </button>
                    </div>
                )}

                {!hasAnyFailed && !isAllReady && (
                    <p className="text-xs text-muted-foreground m-0">
                        Checking services... {globalSecondsRemaining}s remaining
                    </p>
                )}

                {hasAnyFailed && (
                    <div className="flex flex-col gap-2.5 items-center">
                        <p className="text-xs text-destructive font-medium m-0 leading-relaxed">
                            Some services took too long to respond. The site may not work as expected if services are offline.
                        </p>
                        <button
                            onClick={startWarmupSequence}
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
