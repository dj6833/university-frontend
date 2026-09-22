import React from "react";
import { useNotification } from "@refinedev/core";

export const useTodoToast = () => {
    const { open } = useNotification();
    const handleUnimplemented = (
        e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
        feature: string
    ) => {
        e.preventDefault();
        open?.({
            type: "error",
            //message: `${feature} feature is coming soon!`,
            message: `${feature}`,
            cancelMutation: undefined,
        });
    };

    return handleUnimplemented;
};
