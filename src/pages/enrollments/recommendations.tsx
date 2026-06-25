import { useDocumentTitle } from "@refinedev/react-router";
import {APP_TITLE_SUFFIX} from "@/constants";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";

import {useIsMobile} from "@/hooks/use-mobile";
import {Button} from "@/components/ui/button";

import { useCustom } from "@refinedev/core";

import { Skeleton } from "@/components/ui/skeleton";

import { Sparkles, GraduationCap, BookOpen, User } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { dataProvider } from "@/providers/data";

import { useSearchParams } from "react-router";

// import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
// import {
//     Drawer,
//     DrawerContent,
//     DrawerDescription,
//     DrawerHeader,
//     DrawerTitle,
//     DrawerTrigger,
// } from "@/components/ui/drawer";

//import { useNavigate } from "react-router";

//import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RecommendationItem {
    id: number;
    classId: string;
    match_strength: number;
    subject?: { name: string; code: string };
    teacher?: { name: string; email: string };
}

interface RecommendationApiResponse {
    data: RecommendationItem[];
}

// type RecommendedClassesListItem = {
//     id: number;
//     name: string;
//     status: "active" | "inactive";
//     bannerUrl?: string;
//     match_strength: number;
//     subjects?: {
//         name: string;
//     };
//     teacher?: {
//         name: string;
//     };
// };

// const RecommendedClassList = () => {
//     //const [searchQuery, setSearchQuery] = useState("");
//     //const navigate = useNavigate();
//
//     const RecommendedClassesColumns = useMemo<ColumnDef<RecommendedClassesListItem>[]>(
//         () => [
//             {
//                 id: "banner",
//                 accessorKey: "bannerUrl",
//                 size: 60,
//                 header: () => <p className="column-title ml-2"></p>,
//                 cell: ({getValue}) => {
//                     const bannerUrl = getValue<string>();
//
//                     return bannerUrl ? (
//                         <img
//                             src={bannerUrl}
//                             alt="Class banner"
//                             className="ml-2 h-10 w-10 rounded-md object-cover"
//                             loading="lazy"
//                         />
//                     ) : (
//                         <span className="text-muted-foreground ml-2">No image</span>
//                     );
//                 },
//             },
//             {
//                 id: "name",
//                 accessorKey: "name",
//                 size: 220,
//                 header: () => <p className="column-title">Class Name</p>,
//                 cell: ({getValue}) => (
//                     <span className="text-foreground">{getValue<string>()}</span>
//                 ),
//                 filterFn: "includesString",
//             },
//             {
//                 id: "status",
//                 accessorKey: "status",
//                 size: 140,
//                 header: () => <p className="column-title">Status</p>,
//                 cell: ({getValue}) => {
//                     const status = getValue<"active" | "inactive">();
//                     const variant = status === "active" ? "default" : "secondary";
//
//                     return <Badge variant={variant}>{status}</Badge>;
//                 },
//             },
//             {
//                 id: "subject",
//                 accessorKey: "subjects.name",
//                 size: 200,
//                 header: () => <p className="column-title">Subject</p>,
//                 cell: ({getValue}) => {
//                     const subjectName = getValue<string>();
//
//                     return subjectName ? (
//                         <Badge variant="secondary">{subjectName}</Badge>
//                     ) : (
//                         <span className="text-muted-foreground">Not set</span>
//                     );
//                 },
//             },
//             {
//                 id: "teacher",
//                 accessorKey: "teacher.name",
//                 size: 200,
//                 header: () => <p className="column-title">Teacher</p>,
//                 cell: ({getValue}) => {
//                     const teacherName = getValue<string>();
//
//                     return teacherName ? (
//                         <span className="text-foreground">{teacherName}</span>
//                     ) : (
//                         <span className="text-muted-foreground">Not assigned</span>
//                     );
//                 },
//             },
//             {
//                 id: "details",
//                 size: 140,
//                 header: () => <p className="column-title">Details</p>,
//                 cell: ({ row }) => (
//                     <ShowButton
//                         resource="classes"
//                         recordItemId={row.original.id}
//                         variant="outline"
//                         size="sm"
//                     >
//                         View
//                     </ShowButton>
//                 ),
//             },
//
//         ],
//         []
//     );
//
//     // const searchFilters = searchQuery
//     //     ? [
//     //         {
//     //             field: "name",
//     //             operator: "contains" as const,
//     //             value: searchQuery,
//     //         },
//     //     ]
//     //     : [];
//
//     const RecommendedClassesTable = useTable<RecommendedClassesListItem>({
//         columns: RecommendedClassesColumns,
//         refineCoreProps: {
//             resource: "enrollments",
//             pagination: {
//                 pageSize: 10,
//                 mode: "server",
//             },
//             // filters: {
//             //     permanent: [...searchFilters],
//             //},
//             sorters: {
//                 initial: [
//                     {
//                         field: "name",
//                         order: "desc",
//                     },
//                 ],
//             },
//         },
//     });
//
//     return (
//         <ListView>
//             <Breadcrumb />
//             <h1 className="page-title">My Class Recommendations</h1>
//             <div className="intro-row">
//                 <p>Below are your recommended classes, based on classes that similar students have been joining</p>
//                 <div className="actions-row">
//                     {/*<div className="search-field">*/}
//                     {/*    <Search className="search-icon" />*/}
//                     {/*    <Input*/}
//                     {/*        type="text"*/}
//                     {/*        placeholder="Search name or subject..."*/}
//                     {/*        className="pl-10 w-full h-9"*/}
//                     {/*        value={searchQuery}*/}
//                     {/*        onChange={(event) => setSearchQuery(event.target.value)}*/}
//                     {/*    />*/}
//                     {/*</div>*/}
//                 </div>
//             </div>
//
//             <DataTable table={RecommendedClassesTable} />
//
//         </ListView>
//     );
//
// };

export const RecommendedClassList = () => {
    useDocumentTitle(`Recommended Classes ${APP_TITLE_SUFFIX}`);
    const apiBaseUrl = dataProvider.getApiUrl();
    useDocumentTitle("My Custom Title");

    const { query } = useCustom<RecommendationItem>({
        // 🌟 THE FIX: Combine the base URL with your relative target path!
        // Compiles cleanly to: http://localhost:8000/api/enrollments/recommendations
        url: `${apiBaseUrl}enrollments/recommendations`,
        method: "get",
        queryOptions: {
            queryKey: ["custom-enrollments-recommendations-page-view"],
            retry: false,
            refetchOnWindowFocus: false,
        }
    });

    // const { query } = useCustom<RecommendationItem>({
    //     url: "api/enrollments/recommendations", // Refine prepends your base API URL automatically
    //     method: "get",
    //     queryOptions: {
    //         // Assign an isolated, explicit unique key tracker block for this specific screen list layout
    //         queryKey: ["custom-enrollments-recommendations-page-view"],
    //
    //         // Safety guards to keep it running smoothly
    //         retry: false,
    //         refetchOnWindowFocus: false,
    //     }
    // });

    // 3. Drill through the data wrapper structure safely
    const recommendations: RecommendationItem[] = (query.data as any)?.data?.data ?? [];
    const isLoading = query.isLoading;
    const isError = query.error;

    // 4. Loading Skeleton State Layout
    if (isLoading) {
        return (
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (isError) return <div className="p-6 text-destructive">Failed to calculate matching tracks.</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    Recommended Classes
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Personalized curriculum tracks computed via peer-student scheduling models.
                </p>
            </div>

            {/* Grid Track Layout */}
            {recommendations.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg">
                    No matching pathways calculated at this time. Check back later!
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {recommendations.map((item) => (
                        <Card key={item.id} className="hover:border-primary/40 transition-colors shadow-none bg-white">
                            <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {item.subject?.code || `CLASS #${item.classId}`}
                  </span>
                                    <CardTitle className="text-lg font-bold mt-2">
                                        {item.subject?.name || "Subject Code"}
                                    </CardTitle>
                                </div>
                                {/* Visual Highlight Badge */}
                                <div className="flex flex-col items-end shrink-0">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {item.match_strength}% Match
                  </span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2 text-sm text-muted-foreground space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground/60" />
                                    <span>{item.teacher?.name || "Instructor Unassigned"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
                                    <span>Class Record Primary ID: {item.id}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecommendedClassList;
