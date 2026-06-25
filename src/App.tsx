import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerProvider, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier
} from "@refinedev/react-router";
import {BrowserRouter, Navigate, Outlet, Route, Routes} from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import {
  BookOpen,
  Building2,
  ClipboardCheck,
  GraduationCap,
  Home,
  Users,
} from "lucide-react";
import SubjectsList from "./pages/subjects/list";
import { Layout } from "./components/refine-ui/layout/layout";
import SubjectsCreate from "./pages/subjects/create";
import SubjectsShow from "./pages/subjects/show";
import Dashboard from "./pages/dashboard";

import { dataProvider } from "./providers/data";
import ClassesList from "./pages/classes/list";
import ClassesCreate from "./pages/classes/create";
import ClassesShow from "./pages/classes/show";
import { authProvider } from "./providers/auth";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import DepartmentsList from "./pages/departments/list";
import DepartmentsCreate from "./pages/departments/create";
import DepartmentShow from "./pages/departments/show";
import FacultyList from "./pages/faculty/list";
import FacultyShow from "./pages/faculty/show";
import EnrolmentList from "@/pages/enrollments/list.tsx";
import EnrollmentsCreate from "./pages/enrollments/create";
import EnrollmentsJoin from "./pages/enrollments/join";
import EnrollmentConfirm from "./pages/enrollments/confirm";
import RecommendedClassList from "@/pages/enrollments/recommendations.tsx";

/*
Globally force all browser fetch requests to include cookies, ensuring our session cookie is passed
*/

const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  // Force the Better Auth credentials on ALL outbound requests
  return originalFetch(input, {
    ...init,
    credentials: "include",
  });
};

// const CustomTitle = ({ collapsed }: { collapsed: boolean }) => (
//     <div className="flex items-center gap-2 px-2 py-1 font-bold text-slate-800">
//       <GraduationCap className="h-6 w-6 text-indigo-600 flex-shrink-0" />
//       {!collapsed && <span className="text-base tracking-tight">University of Oakfield</span>}
//     </div>
// );

// const PortalTitle = ({ collapsed }: { collapsed: boolean }) => (
//     <div className="flex items-center gap-2 px-1 py-2 font-bold text-slate-900 select-none">
//       {/* 🌟 THE LOGO IMAGE: Remains completely locked in place on collapse */}
//       <img
//           src="/logo.png"
//           alt="Logo"
//           className="h-6 w-6 object-contain flex-shrink-0"
//       />
//
//       {/* 🌟 THE WORKSPACE STRING TEXT: Gracefully fades away only when collapsed */}
//       {!collapsed && <span className="text-base tracking-tight">AcademyPortal</span>}
//     </div>
// );

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                title: {
                  text: "University of Oakfield",
                  //icon: <GraduationCap className="h-6 w-6 text-indigo-600" />,
                  icon: (
                      <img
                          src="/logo.png"
                          alt="Logo"
                          className="h-6 w-6 min-w-[24px] min-h-[24px] object-contain flex-shrink-0"
                      />
                  ),
                },
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "mG476x-8Tj0nI-6mS6lr",
                reactQuery: {
                  clientConfig: {
                    defaultOptions: {
                      queries: {
                        retry: (failureCount, error: any) => {
                          // Because we throw HttpError, statusCode is guaranteed to be a number
                          const status = error?.statusCode;

                          if (status === 401 || status === 403) {
                            return false; // Fail instantly for authentication and permission blocks
                          }

                          return failureCount < 3; // Maintain Refine default of 3x request retries for other types of request issues
                        },
                      },
                    },
                  },
                },
              }}
              resources={[
                  {
                  name: "dashboard",
                  list: "/",
                  meta: {
                    label: "Home",
                    icon: <Home />,
                  },
                },
                {
                  name: "subjects",
                  list: "/subjects",
                  create: "/subjects/create",
                  show: "/subjects/show/:id",
                  meta: {
                    label: "Subjects",
                    icon: <BookOpen />,
                  },
                },
                {
                  name: "departments",
                  list: "/departments",
                  show: "/departments/show/:id",
                  create: "/departments/create",
                  meta: {
                    label: "Departments",
                    icon: <Building2 />,
                  },
                },
                {
                  name: "users",
                  list: "/faculty",
                  show: "/faculty/show/:id",
                  meta: {
                    label: "Faculty",
                    icon: <Users />,
                  },
                },
                {
                  name: "enrollments",
                  list: "/enrollments",
                  create: "/enrollments/create",
                  meta: {
                    label: "My Classes",
                    icon: <ClipboardCheck />,
                  },
                },
                {
                  name: "classes",
                  list: "/classes",
                  create: "/classes/create",
                  show: "/classes/show/:id",
                  meta: {
                    label: "All Classes",
                    icon: <GraduationCap />,
                  },
                },
              ]}
            >
              <Routes>
                {/* PUBLIC ROUTES (Login / Register) */}
                <Route
                    element={
                      <Authenticated
                          key="public-routes"
                          fallback={<Outlet />} // If NOT logged in, let them access login/register
                      >
                        {/* If ALREADY logged in, automatically push them to the default logged-in resource */}
                        <NavigateToResource />
                      </Authenticated>
                    }
                >
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* 2. PROTECTED PRIVATE ROUTES */}
                <Route
                    element={
                      <Authenticated
                          key="private-routes"
                          // Todo: consider CatchAllNavigate here to call /login while preserving the return-to details in the URL
                          // (but needs work to handle session timeout vs intentional user-logged-off behaviour)
                          // fallback={<CatchAllNavigate to="/login" />}
                          fallback={<Navigate to="/login" />}
                      >
                        <Layout>
                          <Outlet />
                        </Layout>
                      </Authenticated>
                    }
                >
                  <Route path="/" element={<Dashboard />} />

                  <Route path="subjects">
                    <Route index element={<SubjectsList />} />
                    <Route path="create" element={<SubjectsCreate />} />
                    <Route path="show/:id" element={<SubjectsShow />} />
                  </Route>

                  <Route path="departments">
                    <Route index element={<DepartmentsList />} />
                    <Route path="create" element={<DepartmentsCreate />} />
                    <Route path="show/:id" element={<DepartmentShow />} />
                  </Route>

                  <Route path="faculty">
                    <Route index element={<FacultyList />} />
                    <Route path="show/:id" element={<FacultyShow />} />
                  </Route>

                  <Route path="enrollments">
                    <Route index element={<EnrolmentList />} />
                    <Route path="create" element={<EnrollmentsCreate />} />
                    <Route path="join" element={<EnrollmentsJoin />} />
                    <Route path="confirm" element={<EnrollmentConfirm />} />
                    <Route path="recommendations" element={<RecommendedClassList />} />
                  </Route>

                  <Route path="classes">
                    <Route index element={<ClassesList />} />
                    <Route path="create" element={<ClassesCreate />} />
                    <Route path="show/:id" element={<ClassesShow />} />
                  </Route>
                </Route>
              </Routes>

              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
