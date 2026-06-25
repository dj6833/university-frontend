import { useDocumentTitle } from "@refinedev/react-router";
import {APP_TITLE_SUFFIX} from "@/constants";
import { SignInForm } from "@/components/refine-ui/form/sign-in-form";

export const Login = () => {
  useDocumentTitle(`Sign In ${APP_TITLE_SUFFIX}`);
  return <SignInForm />;
};
