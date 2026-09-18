type Listener = (visible: boolean, source: "automated" | "manual") => void;
const listeners = new Set<Listener>();

// ==========================================
// 💡 CENTRAL CONFIGURATION CONSTANTS
// ==========================================
// Throttles automated popups to run at most once every 10 minutes
const AUTOMATED_THROTTLE_WINDOW_MS = 20 * 1000 //10 * 60 * 1000;

export const infrastructureState = {
    isVisible: false,
    triggerSource: "automated" as "automated" | "manual",

    subscribe: (listener: Listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },

    triggerCheck: (source: "automated" | "manual") => {
        console.log(`Global State: Infrastructure check requested via ${source}.`);
        infrastructureState.isVisible = true;
        infrastructureState.triggerSource = source;
        listeners.forEach((l) => l(true, source));
    },

    closeCheck: () => {
        infrastructureState.isVisible = false;
        infrastructureState.triggerSource = "automated";
        listeners.forEach((l) => l(false, "automated"));
    }
};

export const evaluateInfrastructureLifespan = (isManualClick = false): void => {
    const currentTimestamp = Date.now();
    const lastPing = sessionStorage.getItem("infra_last_warmup");

    // 💡 Uses the centralized constant parameter for the session lifespan math
    if (!isManualClick && lastPing) {
        const timeSinceLastPing = currentTimestamp - parseInt(lastPing, 10);
        if (timeSinceLastPing < AUTOMATED_THROTTLE_WINDOW_MS) {
            return;
        }
    }

    if (!isManualClick) {
        sessionStorage.setItem("infra_last_warmup", currentTimestamp.toString());
    }

    // Check if this specific browser tab session has already acknowledged the greeting
    const hasSeenBefore = sessionStorage.getItem("infra_has_seen_monitor");

    let forcedSource: "automated" | "manual" = isManualClick ? "manual" : "automated";

    // If it's an automated background check but it's a fresh tab session,
    // upgrade the source to "manual" so the card stays open as a greeting!
    if (!isManualClick && !hasSeenBefore) {
        console.log("Infrastructure Lifespan: Fresh tab session detected. Forcing sticky layout.");
        forcedSource = "manual";
    }

    infrastructureState.triggerCheck(forcedSource);
};

export const triggerManualServiceCheck = (): void => {
    evaluateInfrastructureLifespan(true);
};
