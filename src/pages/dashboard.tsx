import { useDocumentTitle } from "@refinedev/react-router";
import { APP_TITLE_SUFFIX } from "@/constants";
import { useCan, useGetIdentity, useLink, useCustom } from "@refinedev/core";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BookOpen,
  Building2,
  GraduationCap,
  ShieldCheck,
  Users,
  Lectern
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { User } from "@/types";

const HARDCODED_PALETTE = [
  "#d97706", // Dark Amber
  "#0284c7", // Ocean Blue
  "#059669", // Soft Emerald
  "#7c3aed", // Soft Purple
  "#db2777", // Deep Rose
  "#e11d48", // Slate Red
  "#0891b2", // Muted Cyan
  "#ca8a04", // Mustard Gold
  "#4f46e5", // Muted Indigo
  "#2563eb"  // Slate Blue
];


const Dashboard = () => {
  useDocumentTitle(`Dashboard ${APP_TITLE_SUFFIX}`);
  const { data: user } = useGetIdentity<User>();
  const Link = useLink();

  const { data: canViewUserData } = useCan({
    resource: "dashboard-user-panel",
    action: "view",
    params: { user },
  });

  interface OverviewResponse {
    users: Array<{ count: number }>;
    teachers: Array<{ count: number }>;
    admins: Array<{ count: number }>;
    subjects: Array<{ count: number }>;
    departments: Array<{ count: number }>;
    classes: Array<{ count: number }>;
  }

  interface LatestResponse {
    latestClasses: Array<{
      id: number;
      name: string;
      subject?: { name: string };
      teacher?: { name: string };
    }>;
    latestTeachers: Array<{
      id: number;
      name: string;
      email: string;
    }>;
  }

  interface ChartsResponse {
    studentsPerDepartment: Array<{ department: string; total: number }>;
    busiestTeachers: Array<{ name: string; classCount: number }>;
    studentsBySubject: Array<{ subjectName: string; totalEnrollments: number }>;
  }

  const overviewQuery = useCustom<OverviewResponse>({ url: "api/stats/overview", method: "get" }) as any;
  const latestQuery = useCustom<LatestResponse>({ url: "api/stats/latest", method: "get" }) as any;
  const chartsQuery = useCustom<ChartsResponse>({ url: "api/stats/charts", method: "get" }) as any;

  const overviewData = overviewQuery?.result?.data?.data ?? {};
  const latestData = latestQuery?.result?.data?.data ?? { latestClasses: [], latestTeachers: [] };
  const chartsData = chartsQuery?.result?.data?.data ?? { studentsPerDepartment: [], busiestTeachers: [], studentsBySubject: [] };

  const newestClasses = latestData.latestClasses ?? [];
  const newestTeachers = latestData.latestTeachers ?? [];

  const subjects = { length: overviewData.subjects?.[0]?.count ?? 0 };
  const departments = { length: overviewData.departments?.[0]?.count ?? 0 };
  const classes = { length: overviewData.classes?.[0]?.count ?? 0 };

  const kpis = [
    { label: "Total Users", value: overviewData.users?.[0]?.count ?? 0, icon: Users, accent: "text-blue-500" },
    { label: "Lecturers", value: overviewData.teachers?.[0]?.count ?? 0, icon: Lectern, accent: "text-emerald-500" },
    { label: "Admins", value: overviewData.admins?.[0]?.count ?? 0, icon: ShieldCheck, accent: "text-amber-500" },
    { label: "Subjects", value: subjects.length, icon: BookOpen, accent: "text-purple-500" },
    { label: "Departments", value: departments.length, icon: Building2, accent: "text-cyan-500" },
    { label: "Classes", value: classes.length, icon: GraduationCap, accent: "text-rose-500" },
  ];

    return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-muted-foreground">
          A quick snapshot of the latest activity and key metrics.
        </p>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 sm:grid-cols-2 ${canViewUserData?.can ? "lg:grid-cols-3 xl:grid-cols-6" : "lg:grid-cols-3"}`}>

            {kpis
                .filter((kpi) => {
                  if (["Total Users", "Lecturers", "Admins"].includes(kpi.label)) {
                    return !!canViewUserData?.can;
                  }
                  return true;
                })
                .map((kpi) => (
                    <div
                        key={kpi.label}
                        className="rounded-lg border border-border bg-muted/20 p-4 hover:border-primary/40 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {kpi.label}
                        </p>
                        <kpi.icon className={`h-4 w-4 ${kpi.accent}`} />
                      </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {kpi.label === "Total Users" || kpi.label === "Lecturers" || kpi.label === "Admins"
                      ? kpi.value
                      : kpi.value.toLocaleString()}
          </div>
              </div>
                ))}
              </div>
            </CardContent>
          </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col justify-between border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-transparent">
            <h3 className="text-sm font-semibold text-gray-500">
              Student Distribution per Department
            </h3>

            <div className="flex flex-col items-center justify-center min-h-[300px] mt-2">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                        data={chartsData.studentsPerDepartment}
                        dataKey="total"
                        nameKey="department"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={2}
                        isAnimationActive={true}
                        animationDuration={800}
                    >
                      {chartsData.studentsPerDepartment?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={HARDCODED_PALETTE[index % HARDCODED_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderColor: "#e4e4e7", borderRadius: "8px" }}
                        formatter={(value, name) => [`${Number(value).toLocaleString()} Students`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-4 px-2 w-full">
                {chartsData.studentsPerDepartment?.map((entry, index) => (
                    <div key={entry.department} className="flex items-center gap-1.5 text-xs shrink-0">
            <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: HARDCODED_PALETTE[index % HARDCODED_PALETTE.length] }}
            />
                      <span className="font-medium text-gray-600 dark:text-gray-400">
              {entry.department}
            </span>
                    </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">

            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-transparent space-y-3 flex-1 flex flex-col justify-between">
              <h3 className="text-sm font-semibold text-gray-500">
                Top Subjects by Enrolment
              </h3>
              <div className="h-32 w-full flex justify-center">
                <div className="w-full max-w-[500px] h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartsData.studentsBySubject} layout="horizontal" margin={{ bottom: 5 }}>
                      <XAxis dataKey="subjectName" tick={{ fontSize: 10, fill: "#6b7280" }} interval={0} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} hide />
                      <Tooltip
                          contentStyle={{ backgroundColor: "#fff", borderColor: "#e4e4e7", borderRadius: "8px" }}
                          separator=""
                          formatter={(value) => [`${value} Students Enrolled`, ""]}
                      />
                      <Bar dataKey="totalEnrollments" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} isAnimationActive={true} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-transparent space-y-3 flex-1 flex flex-col justify-between">
              <h3 className="text-sm font-semibold text-gray-500">
                Lecturers with Highest Class Allocations
              </h3>
              <div className="h-32 w-full flex justify-center">
                <div className="w-full max-w-[500px] h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartsData.busiestTeachers} layout="horizontal" margin={{ bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} interval={0} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} hide />
                      <Tooltip
                          contentStyle={{ backgroundColor: "#fff", borderColor: "#e4e4e7", borderRadius: "8px" }}
                          separator=""
                          formatter={(value) => [`${value} Classes Assigned`, ""]}
                      />
                      <Bar dataKey="classCount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} isAnimationActive={true} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
      <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Newest Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newestClasses.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No recent classes.
              </p>
            )}
            {newestClasses.map((item, index) => (
              <Link
                key={item.id}
                to={`/classes/show/${item.id}`}
                className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.subject?.name ?? "No subject"} ·{" "}
                      {item.teacher?.name ?? "No lecturer"}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">New</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Newest Lecturers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {newestTeachers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No recent lecturers.
                </p>
              )}
              {newestTeachers.map((teacher, index) => (
                <Link
                  key={teacher.id}
                  to={`/faculty/show/${teacher.id}`}
                  className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 transition-colors hover:border-primary/30 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {teacher.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

      </div>

      <Separator />
    </div>
  );
};

export default Dashboard;
