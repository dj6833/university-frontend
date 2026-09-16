import React, { useEffect, useState } from "react";
import {BACKEND_ANALYSIS_SERVICE_URL, BACKEND_BASE_URL} from "@/constants";
import { infrastructureState } from "../lib/infrastructure";

interface ServiceState {
    id: string;
    name: string;
    status: "pending" | "loading" | "ready" | "failed";
    url: string;
    attempts: number;
    mode: "cors" | "no-cors";
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const InfrastructureMonitor: React.FC = () => {
    const [isVisible, setIsVisible] = useState(infrastructureState.isVisible);
    const [services, setServices] = useState<ServiceState[]>([]);

    const pollServiceStatus = async (id: string, url: string, mode: "cors" | "no-cors") => {
        let isLive = false;
        const maxAttempts = 22;
        let currentAttempts = 0;

        while (!isLive && currentAttempts < maxAttempts) {
            try {
                currentAttempts++;

                setServices((prev) =>
                    prev.map((s) => s.id === id ? { ...s, status: "loading", attempts: currentAttempts } : s)
                );

                const response = await fetch(url, {
                    method: "GET",
                    mode: mode
                });

                if (response.status === 404) {
                    throw new Error("Endpoint configuration pending");
                }

                if (response.ok || (mode === "no-cors" && response.type === "opaque")) {
                    isLive = true;
                    setServices((prev) =>
                        prev.map((s) => s.id === id ? { ...s, status: "ready", attempts: maxAttempts } : s)
                    );
                    break;
                }
            } catch (err) {
                // Connection drops caught smoothly during container cold starts
            }

            if (!isLive) {
                if (currentAttempts >= maxAttempts) {
                    setServices((prev) =>
                        prev.map((s) => s.id === id ? { ...s, status: "failed" } : s)
                    );
                    break;
                }
                await sleep(4000);
            }
        }
    };

    useEffect(() => {
        const basePrimaryWebServiceUrl = BACKEND_BASE_URL.replace(/\/$/, "");
        const baseAnalysisEngineUrl = BACKEND_ANALYSIS_SERVICE_URL.replace(/\/$/, "");

        const handleStateChange = (visible: boolean) => {
            setIsVisible(visible);

            if (visible) {
                const initialServices: ServiceState[] = [
                    {
                        id: "1",
                        name: "Primary Web Service",
                        status: "loading",
                        url: `${basePrimaryWebServiceUrl}/health/warmup/primary-webservice`,
                        attempts: 0,
                        mode: "cors"
                    },
                    {
                        id: "2",
                        name: "Database Service",
                        status: "loading",
                        url: `${basePrimaryWebServiceUrl}/health/warmup/database`,
                        attempts: 0,
                        mode: "cors"
                    },
                    {
                        id: "3",
                        name: "Analysis Engine",
                        status: "loading",
                        url: `${baseAnalysisEngineUrl}/healthz`,
                        attempts: 0,
                        mode: "no-cors"
                    }
                ];

                setServices(initialServices);
                initialServices.forEach((service) => {
                    pollServiceStatus(service.id, service.url, service.mode);
                });
            }
        };

        const unsubscribe = infrastructureState.subscribe(handleStateChange);
        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (services.length > 0 && services.every((s) => s.status === "ready")) {
            const timeout = setTimeout(() => {
                infrastructureState.closeCheck();
                setServices([]);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [services]);

    const handleRetrySpecificService = (id: string, url: string, mode: "cors" | "no-cors") => {
        setServices((prev) =>
            prev.map((s) => s.id === id ? { ...s, status: "loading", attempts: 0 } : s)
        );
        pollServiceStatus(id, url, mode);
    };

    if (!isVisible) return null;

    const hasAnyFailed = services.some((s) => s.status === "failed");

    return (
        <div style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 9999,
            width: "360px",
            padding: "20px",
            background: "#1e1e2e",
            color: "#cdd6f4",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            fontFamily: "monospace",
            border: "1px solid #313244",
        }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", borderBottom: "1px solid #313244", paddingBottom: "8px", color: "#f5c2e7" }}>
                System Environment Check
            </h3>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0" }}>
                {services.map((service) => {
                    const percentComplete = Math.min((service.attempts / 22) * 100, 100);

                    return (
                        <li key={service.id} style={{ margin: "14px 0", fontSize: "13px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                                <span style={{ color: "#cdd6f4" }}>{service.name}</span>

                                {service.status === "failed" ? (
                                    <button
                                        onClick={() => handleRetrySpecificService(service.id, service.url, service.mode)}
                                        style={{
                                            background: "#f38ba8",
                                            border: "none",
                                            color: "#11111b",
                                            cursor: "pointer",
                                            fontSize: "11px",
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        RETRY
                                    </button>
                                ) : (
                                    <span style={{
                                        fontWeight: "bold",
                                        color: service.status === "ready" ? "#a6e3a1" : "#f9e2af"
                                    }}>
                                        {service.status === "ready" ? "[ONLINE]" : `${Math.round(percentComplete)}%`}
                                    </span>
                                )}
                            </div>

                            <div style={{ width: "100%", height: "4px", background: "#313244", borderRadius: "2px", overflow: "hidden" }}>
                                <div style={{
                                    width: `${percentComplete}%`,
                                    height: "100%",
                                    background: service.status === "ready" ? "#a6e3a1" : service.status === "failed" ? "#f38ba8" : "#f9e2af",
                                    transition: "width 0.4s ease-out, background-color 0.3s ease"
                                }} />
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div style={{ fontSize: "11px", color: "#6c7086", textAlign: "center", borderTop: "1px solid #313244", paddingTop: "10px", marginTop: "14px" }}>
                {services.every((s) => s.status === "ready") && "All systems nominal. Environment ready."}
                {hasAnyFailed && "Some services took too long to respond. Tap retry."}
                {!hasAnyFailed && !services.every((s) => s.status === "ready") && "Waking cloud containers from eco-sleep..."}
            </div>
        </div>
    );
};
