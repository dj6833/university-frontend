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

import { Sparkles, GraduationCap, BookOpen, User, Bookmark, HelpCircle } from "lucide-react";

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
    bannerUrl?: string;
    subject?: { name: string; code: string };
    teacher?: { name: string; email: string };
}

interface RecommendationApiResponse {
    data: RecommendationItem[];
}

export const RecommendationsVisualGrid = ({ data }: { data: RecommendationItem[] }) => {

    // 🌟 HELPER RULE: Evaluates your match strength percentage and returns a clean, compliant RAG styling token
    const getRagStyles = (strength: number) => {
        if (strength >= 80) {
            return "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400"; // Red-Amber-Green: Green (Strong Match)
        }
        if (strength >= 65) {
            return "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400";   // Red-Amber-Green: Amber (Medium Match)
        }
        return "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400";       // Red-Amber-Green: Red (Lower Match)
    };

    return (
        <div className="w-full space-y-6">
            {/* 1. Responsive Multi-Column Grid Space */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {data.map((item) => {
                    const ragClass = getRagStyles(item.match_strength);

                    return (
                        <div
                            key={item.id}
                            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                        >
                            {/* 2. Visual Top Cover Header (Houses your Image & RAG Badging) */}
                            <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                                {item.bannerUrl ? (
                                    <img
                                        src={item.bannerUrl}
                                        alt={item.subject?.name || "Class Cover"}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    // Elegant vector fallback canvas if a database record has no cover image url
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-400">
                                        <Bookmark className="h-10 w-10 opacity-40" />
                                    </div>
                                )}

                                {/* Floating RAG Badge */}
                                <div className={`absolute right-3 top-3 inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold shadow-xs backdrop-blur-md ${ragClass}`}>
                                    <Sparkles className="mr-1 h-3 w-3" />
                                    {item.match_strength}% Match
                                </div>
                            </div>

                            {/* 3. Core Metadata Body (Neatly lists all 5-6 tracking parameters) */}
                            <div className="flex flex-1 flex-col p-5">

                                {/* Row 1: Course Identification Code */}
                                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase font-mono">
                  {item.subject?.code || `CLASSID #${item.classId}`}
                </span>

                                {/* Row 2: Main Bold Title */}
                                <h3 className="mt-1 text-base font-bold text-slate-900 line-clamp-1">
                                    {item.subject?.name || "Unassigned Subject"}
                                </h3>

                                {/* Row 3: Instructor Information */}
                                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate font-medium">
                    {item.teacher?.name || "Instructor Unassigned"}
                  </span>
                                </div>

                                {/* Divider Line */}
                                <div className="my-4 border-t border-slate-100" />

                                {/* Row 4 & 5: Functional Footer Metrics (Database IDs & Action Hooks) */}
                                <div className="mt-auto flex items-center justify-between gap-2">
                                    <div className="flex flex-col text-[10px] font-mono text-slate-400">
                                        <span>RECORD ID: {item.id}</span>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={() => console.log(`Quick join sequence triggered for entry: ${item.id}`)}
                                    >
                                        Join Class
                                    </Button>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const RecommendedClassListOpt1 = () => {
    // Extract your environment backend url prefix: http://localhost:8000/api
    const apiBaseUrl = dataProvider.getApiUrl();

    // 3. Execute the type-safe fetch hook using your unique cache key tracker
    const { query } = useCustom<RecommendationItem[]>({
        url: `${apiBaseUrl}enrollments/recommendations`,
        method: "get",
        queryOptions: {
            queryKey: ["custom-enrollments-recommendations-view-grid"],
            retry: false,
            refetchOnWindowFocus: false,
        }
    });

    // 4. Safely extract the inner recommendations array payload
    const recommendations: RecommendationItem[] = (query.data as any)?.data?.data ?? [];
    const isLoading = query.isLoading;
    const isError = query.isError;

    // 🌟 LOADING STATE: Displays matching modern skeletons while your Postgres rows load
    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-1/4 rounded-md" />
                    <Skeleton className="h-4 w-1/3 rounded-md" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                        <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden bg-white p-0 space-y-4">
                            <Skeleton className="aspect-[16/10] w-full" />
                            <div className="p-5 space-y-3">
                                <Skeleton className="h-3 w-1/4" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-4" />
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <Skeleton className="h-3 w-1/3" />
                                    <Skeleton className="h-8 w-20 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ERROR STATE: Friendly catch block
    if (isError) {
        return (
            <div className="p-6 max-w-7xl mx-auto text-center py-20">
                <p className="text-destructive font-medium">Failed to calculate curriculum tracks.</p>
                <p className="text-xs text-muted-foreground mt-1">Please check your Node.js console logs or backend connection.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">

            {/* Page Title Workspace Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        Recommended Classes
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Personalized curriculum tracks computed via peer-student scheduling models.
                    </p>
                </div>

                {/* Subtle, non-intrusive metadata tracker display */}
                <div className="text-xs font-medium text-muted-foreground bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/40 self-start md:self-auto">
                    Top {recommendations.length} Matches Found
                </div>
            </div>

            {/* 🌟 MAIN PRESENTATION LAYER: Renders Option 1 Card Grids cleanly */}
            {recommendations.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    No matching pathways calculated for your account yet. Check back shortly!
                </div>
            ) : (
                <RecommendationsVisualGrid data={recommendations} />
            )}

        </div>
    );
};

export default RecommendedClassListOpt1;
