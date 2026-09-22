import { useDocumentTitle } from "@refinedev/react-router";
import {APP_TITLE_SUFFIX} from "@/constants";
import { SignInForm } from "@/components/refine-ui/form/sign-in-form";

export const Login = () => {
    useDocumentTitle(`Sign In ${APP_TITLE_SUFFIX}`);

    return (
        <div
            className="relative min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-slate-900 bg-cover bg-center overflow-y-auto"
            style={{
                backgroundImage: "url('/campus-backdrop.avif')"
            }}
        >
            <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] pointer-events-none" />

            {/* 'my-auto' ensures vertical centering on large monitors, while protecting small viewports */}
            <div className="relative z-10 w-full max-w-[540px] my-auto">
                <SignInForm />
            </div>

        </div>
    );
};
