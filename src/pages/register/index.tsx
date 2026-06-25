import { useDocumentTitle } from "@refinedev/react-router";
import {APP_TITLE_SUFFIX} from "@/constants";
import { SignUpForm } from '@/components/refine-ui/form/sign-up-form';

export const Register = () => {
  useDocumentTitle(`Register ${APP_TITLE_SUFFIX}`);
  return <SignUpForm />;
};
