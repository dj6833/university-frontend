import { useDocumentTitle } from "@refinedev/react-router";
import {APP_TITLE_SUFFIX} from "@/constants";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";

import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ListView, ListViewHeader} from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { ShowButton } from "@/components/refine-ui/buttons/show.tsx";

import { cn } from "@/lib/utils";

// import {
//     ShowView,
//     ShowViewHeader,
// } from "@/components/refine-ui/views/show-view.tsx";

import {useIsMobile} from "@/hooks/use-mobile.ts";
import {Button} from "@/components/ui/button.tsx";

import { useCustom } from "@refinedev/core";

import { Skeleton } from "@/components/ui/skeleton.tsx";

import { Sparkles, GraduationCap, BookOpen, User, Bookmark, HelpCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";

import { dataProvider } from "@/providers/data.ts";

import { useSearchParams } from "react-router";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {getInitials} from "@/lib/utils.ts";

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
    name: string;
    classId: string;
    status: string;
    description: string;
    match_strength: number;
    bannerUrl?: string;
    subject?: { name: string; code: string };
    teacher?: { name: string; email: string; image: string };
}

interface RecommendationApiResponse {
    data: RecommendationItem[];
}

export const RecommendationsVisualGrid = ({ data }: { data: RecommendationItem[] }) => {
	useDocumentTitle(`Recommended Classes ${APP_TITLE_SUFFIX}`);
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
                    const status = item.status; // <"active" | "inactive">();
                    const statusVariant = status === "active" ? "default" : "secondary";

                    return (
                        <div
                            key={item.id}
                            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                        >
                            <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                                {item.bannerUrl ? (
                                    <img
                                        src={item.bannerUrl}
                                        alt={item.subject?.name || "Class Cover"}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-400">
                                        <Bookmark className="h-10 w-10 opacity-40" />
                                    </div>
                                )}

                                <div className={`absolute right-3 top-3 inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold shadow-xs backdrop-blur-md ${ragClass}`}>
                                    <Sparkles className="mr-1 h-3 w-3" />
                                    {item.match_strength}% Match
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <Badge className=" h-5" variant={statusVariant}>{status.toUpperCase()}</Badge>

                                <h3 className="mt-1 text-base font-bold text-slate-900 line-clamp-1">
                                    {item.name || "Unassigned Class Name"}
                                </h3>

                                <p className="mt-1 text-xs font-normal text-slate-500 leading-relaxed line-clamp-2">
                                    {item.description}
                                </p>

                                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                                    {/*<User className="h-3.5 w-3.5 text-slate-400 shrink-0" />*/}
                                    <Avatar className="size-7">
                                        {item.teacher?.image && (
                                            <AvatarImage src={item.teacher?.image} alt={item.teacher?.name} />
                                        )}
                                        <AvatarFallback>{getInitials(item.teacher?.name)}</AvatarFallback>
                                    </Avatar>
                                    <span className="truncate font-medium">
                                        {item.teacher?.name || "Instructor Unassigned"}
                                    </span>
                                </div>

                                {/* Divider Line */}
                                <div className="my-4 border-t border-slate-100" />

                                {/* Row 4 & 5: Functional Footer Metrics (Database IDs & Action Hooks) */}
                                <div className="mt-auto flex items-center justify-between gap-2">
                                    <div className="flex flex-col text-[10px] font-mono text-slate-400">
                                        {/*<span>RECORD ID: {item.id}</span>*/}
                                        {
                                            item.subject?.name ? (
                                            <Badge variant="secondary">{item.subject.name}</Badge>
                                            ) : (
                                            <span className="text-muted-foreground">(Subject Unknown)</span>
                                            )
                                        }
                                    </div>

                                    <ShowButton
                                        resource="classes"
                                        recordItemId={item.id}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        View Class
                                    </ShowButton>

                                    {/*/!*<Button size="lg" className="w-full">*!/*/}
                                    {/*<Button size="sm" className="h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">*/}
                                    {/*    View Class*/}
                                    {/*</Button>*/}

                                    {/*<Button*/}
                                    {/*    size="sm"*/}
                                    {/*    className="h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"*/}
                                    {/*    onClick={() => console.log(`Quick join sequence triggered for entry: ${item.id}`)}*/}
                                    {/*>*/}
                                    {/*    View Class*/}
                                    {/*</Button>*/}
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const RecommendedClassList = () => {
    // Extract your environment backend url prefix: http://localhost:8000/api
    const apiBaseUrl = dataProvider.getApiUrl();
	useDocumentTitle("My Custom Title");

    const { query } = useCustom<RecommendationItem[]>({
        url: `${apiBaseUrl}classes/recommendations`,
        method: "get",
        queryOptions: {
            //queryKey: ["custom-enrollments-recommendations-page-view"],
            retry: false,
            refetchOnWindowFocus: false,
        }
    });


    const recommendations: RecommendationItem[] = (query.data as any)?.data?.data ?? [];
    const isLoading = query.isLoading;
    const isError = query.isError;

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

    if (isError) {
        return (
            <div className="p-6 max-w-7xl mx-auto text-center py-20">
                <p className="text-destructive font-medium">Could not load your recommendations.</p>
                <p className="text-xs text-muted-foreground mt-1">Please try again later or contact your site admin</p>
            </div>
        );
    }

    return (
        <ListView>
            <ListViewHeader
                title="Recommended Classes"
                resource="class-recommendations" // Uses your registered resource config block
            />

            <div className="space-y-6 mt-1">
                {/* Your premium subtitle text */}
                <p className="text-muted-foreground text-sm">
                    Consider these classes, popular with students matching your academic profile.
                </p>

                {/* Your 3-column recommendation card grid */}
                {recommendations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-xl bg-slate-50/50">
                        {/* Table Title Styling */}
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">
                            No recommended classes available
                        </h3>

                        {/* Table Subtitle/Description Styling */}
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                            Join at least one class to access your personalised recommendations.
                        </p>
                    </div>
                ) : (
                    <RecommendationsVisualGrid data={recommendations} />
                )}
            </div>

            {/*<div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">*/}

            {/*<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">*/}
            {/*    <div>*/}
            {/*        <Sparkles className="h-6 w-6 text-primary animate-pulse" />*/}
            {/*        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">*/}
            {/*            Recommended Classes*/}
            {/*        </h1>*/}
            {/*        <p className="text-muted-foreground text-sm mt-1">*/}
            {/*            Consider these classes, popular with students matching your academic profile*/}
            {/*        </p>*/}
            {/*    </div>*/}
            {/*    <div className="text-xs font-medium text-muted-foreground bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/40 self-start md:self-auto">*/}
            {/*        Top {recommendations.length} Matches Found*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*{recommendations.length === 0 ? (*/}
            {/*    <div className="text-center py-20 text-muted-foreground border border-dashed border-slate-200 rounded-xl bg-slate-50/50">*/}
            {/*        No recommended classes available for your account yet. Try signing up for some classes to create an academic profile*/}
            {/*    </div>*/}
            {/*) : (*/}
            {/*    <RecommendationsVisualGrid data={recommendations} />*/}
            {/*)}*/}

        </ListView>
    );
};

export default RecommendedClassList;
