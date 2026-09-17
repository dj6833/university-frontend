type Listener = (visible: boolean, source: "automated" | "manual") => void;
const listeners = new Set<Listener>();

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
        listeners.forEach((l) => l(false, "automated"));
    }
};

export const evaluateInfrastructureLifespan = (isManualClick = false): void => {
    const currentTimestamp = Date.now();
    const tenMinutesInMs = 10 * 60 * 1000;
    const lastPing = sessionStorage.getItem("infra_last_warmup");

    if (!isManualClick && lastPing) {
        const timeSinceLastPing = currentTimestamp - parseInt(lastPing, 10);
        if (timeSinceLastPing < tenMinutesInMs) {
            return;
        }
    }

    sessionStorage.setItem("infra_last_warmup", currentTimestamp.toString());
    // Pass the correct signature source down to the listener hook variables
    infrastructureState.triggerCheck(isManualClick ? "manual" : "automated");
};

export const triggerManualServiceCheck = (): void => {
    evaluateInfrastructureLifespan(true);
};
