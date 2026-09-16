type Listener = (visible: boolean) => void;
const listeners = new Set<Listener>();

export const infrastructureState = {
    isVisible: false,

    subscribe: (listener: Listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    triggerCheck: () => {
        console.log("Global State: Infrastructure check requested.");
        infrastructureState.isVisible = true;
        listeners.forEach((l) => l(true));
    },

    closeCheck: () => {
        infrastructureState.isVisible = false;
        listeners.forEach((l) => l(false));
    }
};

export const triggerManualServiceCheck = (): void => {
    console.log("Manual trigger: Dispatched system environment validation check.");
    infrastructureState.triggerCheck();
};
