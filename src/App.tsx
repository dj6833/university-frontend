import { Authenticated, Refine  } from "@refinedev/core";
import { DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { useEffect, useState } from "react";

import routerProvider, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier
} from "@refinedev/react-router";
import {BrowserRouter, Navigate, Outlet, Route, Routes, useLocation} from "react-router";
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
import EnrolmentList from  "@/pages/enrollments/list";
import EnrollmentsCreate from "./pages/enrollments/create";
import EnrollmentsJoin from "./pages/enrollments/join";
import EnrollmentConfirm from "./pages/enrollments/confirm";
import RecommendedClassList from "@/pages/classes/recommendations.tsx";

import { InfrastructureMonitor } from "./components/InfrastructureMonitor";
import {evaluateInfrastructureLifespan} from "@/lib/infrastructure.ts";

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

// ==========================================
// NEW CHILD LAYOUT WRAPPER FOR TRIGGERING BACKEND SERVICE WARMUP
// ==========================================
// 💡 THE COMPONENT DEFERRER:
// It mounts inside the DOM layout stream safely below your context providers.
// This guarantees Vite has finished building its chunks before it executes.
function DeferredMonitor() {
  const location = useLocation();

  useEffect(() => {
    // Executes cleanly once the child framework layout finishes rendering
    evaluateInfrastructureLifespan();
  }, [location.pathname]);

  return <InfrastructureMonitor />;
}

// Your main layout manager stays lean and doesn't call any un-scoped hooks
function RefineLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
      <>
        {children}
        {/* 💡 Safe, deterministic mount placement */}
        <DeferredMonitor />
      </>
  );
}

//works but uses url to determine page name, not always accurate - will attempt overriding in individual pages if necessary
// const PageTitleUpdater = () => {
//   const location = useLocation(); // Safely listens to the browser address URL string changing
//
//   useEffect(() => {
//     const siteName = "University of Oakfield";
//
//     // Extract the primary path segments (e.g., "/enrollments/recommendations" -> ["enrollments", "recommendations"])
//     const pathSegments = location.pathname.split("/").filter(Boolean);
//
//     if (pathSegments.length > 0) {
//       // Capitalise the primary module token word cleanly (e.g., 'enrollments' -> 'Enrollments')
//       const mainModule = pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1);
//
//       // If there's a sub-action page layout (like 'recommendations' or 'show'), map it as a subtitle suffix
//       let subAction = "";
//       if (pathSegments[1]) {
//         subAction = ` | ${pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1)}`;
//       }
//
//       // Sets the raw Chrome browser tab window string natively!
//       document.title = `${mainModule}${subAction} - ${siteName}`;
//     } else {
//       // Fallback text if the student lands on the root dashboard index directory path
//       document.title = siteName;
//     }
//   }, [location]);
//
//   return null; // This is a passive utility wrapper; it renders nothing on your UI screen
// };

//works but flickers first "refine" before using h1
// const PageTitleUpdater = () => {
//   const location = useLocation();
//
//   useEffect(() => {
//     const siteName = "University of Oakfield";
//
//     // 🌟 A small 50ms buffer ensures React has finished mounting your page text first
//     const timeoutId = setTimeout(() => {
//       // Direct query selector scans the active viewport for your page header
//       const pageHeader = document.querySelector("h1");
//
//       if (pageHeader && pageHeader.textContent) {
//         // Automatically grabs "My Classes" or "Recommended Classes" exactly as rendered!
//         document.title = `${pageHeader.textContent.trim()} | ${siteName}`;
//       } else {
//         // Safe structural fallback if a custom page has no h1 layout element
//         document.title = siteName;
//       }
//     }, 50);
//
//     return () => clearTimeout(timeoutId);
//   }, [location]); // Safely re-runs the scanner every single time your URL route updates
//
//   return null;
// };

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
  const schoolName = "University of Oakfield";
  return (
    <BrowserRouter>
      {/*<PageTitleUpdater />*/}
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <RefineLayoutWrapper>
              <Refine
                dataProvider={dataProvider}
                authProvider={authProvider}
                notificationProvider={useNotificationProvider()}
                routerProvider={routerProvider}
                // DocumentTitleHandler={({ resource, action }) => {
                //   const siteName = "University of Oakfield";
                //
                //   if (resource) {
                //     // Capitalises page resource names cleanly (e.g. 'enrollments' -> 'Enrollments')
                //     const pageName = resource.charAt(0).toUpperCase() + resource.slice(1);
                //
                //     // Maps actions cleanly if needed (e.g. show -> Details)
                //     const actionLabel = action && action !== "list" ? ` | ${action}` : "";
                //
                //     return `${pageName}${actionLabel} - ${siteName}`;
                //   }
                //
                //   return siteName;
                // }}

                // i18nProvider={{
                //   translate: (key: string, defaultMessage?: string) => {
                //     // Intercept the default browser suffix rule and force your school name natively!
                //     if (key === "documentTitle.suffix") return ` | ${schoolName}`;
                //     if (key === "documentTitle.default") return schoolName;
                //
                //     // Fall back to standard defaults for any other internal framework layout text keys
                //     return defaultMessage || key;
                //   },
                //   changeLocale: async () => {},
                //   getLocale: () => "en",
                // }}

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
                //applicationName: "University of Oakfield"
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
                    name: "users",
                    list: "/faculty",
                    show: "/faculty/show/:id",
                    meta: {
                      label: "Staff",
                      icon: <Users />,
                    },
                  },
                  {
                    name: "enrollments",
                    list: "/enrollments",
                    create: "/enrollments/create/:id",
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
                  {
                    name: "class-recommendations",
                    list: "/classes/recommendations",
                    meta: {
                      label: "Recommended Classes",
                      parent: "classes",
                      hide: true, //don't show in sidebar
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
                      <Route path="create/:id" element={<EnrollmentsCreate />} />
                      <Route path="join" element={<EnrollmentsJoin />} />
                      <Route path="confirm" element={<EnrollmentConfirm />} />
                    </Route>

                    <Route path="classes">
                      <Route index element={<ClassesList />} />
                      <Route path="create" element={<ClassesCreate />} />
                      <Route path="show/:id" element={<ClassesShow />} />
                      <Route path="recommendations" element={<RecommendedClassList />} />
                    </Route>
                  </Route>
                </Routes>

                <Toaster />
                <RefineKbar />
                <UnsavedChangesNotifier />
                {/*<DocumentTitleHandler />*/}
                {/*<DocumentTitleHandler*/}
                {/*    handler={({ resource, action }) => {*/}
                {/*      if (resource) {*/}
                {/*        // Capitalises the resource name cleanly (e.g., 'subjects' -> 'Subjects')*/}
                {/*        const pageLabel = resource.toString().charAt(0).toUpperCase() + resource.toString().slice(1);*/}
                {/*        const subAction = action && action !== "list" ? ` | ${action}` : "";*/}

                {/*        return `${pageLabel}${subAction} - ${schoolName}`;*/}
                {/*      }*/}
                {/*      return schoolName;*/}
                {/*    }}*/}
                {/*/>*/}
              </Refine>
            </RefineLayoutWrapper>
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
