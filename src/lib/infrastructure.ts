type Listener = (visible: boolean, forceSticky: boolean) => void;
const listeners = new Set<Listener>();

// Set the timeout window between sending warmup requests to backend services
const WARMUP_SERVICES_WINDOW_MS = 60 * 1000; //10 * 60 * 1000;

export const infrastructureState = {
    isVisible: true,
    isSticky: false,

    subscribe: (listener: Listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    // Open the panel and explicitly declare if it must stay wide open (sticky) or can auto-hide
    openCheck: (forceSticky: boolean) => {
        infrastructureState.isVisible = true;
        infrastructureState.isSticky = forceSticky;
        listeners.forEach((l) => l(true, forceSticky));
    },

    closeCheck: () => {
        infrastructureState.isVisible = false;
        infrastructureState.isSticky = false;
        listeners.forEach((l) => l(false, false));
    }
};

export const evaluateInfrastructureLifespan = (): void => {
    const currentTimestamp = Date.now();
    const lastPing = sessionStorage.getItem("infra_last_warmup");
    const hasBeenGreeted = sessionStorage.getItem("infra_session_greeted");

    // If they haven't seen the greeting yet on this browser tab, force it to open wide and stay STICKY
    if (!hasBeenGreeted) {
        sessionStorage.setItem("infra_last_warmup", currentTimestamp.toString());
        infrastructureState.openCheck(true); // true = sticky mode locked
        return;
    }

    // If health check ran previously, check if the period before checking again has crossed
    if (lastPing) {
        const timeSinceLastPing = currentTimestamp - parseInt(lastPing, 10);
        if (timeSinceLastPing < WARMUP_SERVICES_WINDOW_MS) {
            // Safe window: Keep it safely tucked away as a minimized pill
            infrastructureState.closeCheck();
            return;
        }
    }

    // Run an automated check that can auto-hide on completion
    sessionStorage.setItem("infra_last_warmup", currentTimestamp.toString());
    infrastructureState.openCheck(false); // false = automated auto-hide allowed
};
