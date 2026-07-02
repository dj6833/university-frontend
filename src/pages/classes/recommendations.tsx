import { useDocumentTitle } from "@refinedev/react-router";
import {APP_TITLE_SUFFIX, CLASS_CAPACITY_CONFIG} from "@/constants";
import { Badge } from "@/components/ui/badge.tsx";
import { ListView, ListViewHeader} from "@/components/refine-ui/views/list-view.tsx";
import { ShowButton } from "@/components/refine-ui/buttons/show.tsx";
import { useCustom } from "@refinedev/core";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Sparkles, Bookmark } from "lucide-react";
import { dataProvider } from "@/providers/data.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {getInitials} from "@/lib/utils.ts";

interface RecommendationItem {
    id: number;
    name: string;
    classId: string;
    status: string;
    description: string;
    match_strength: number;
    bannerUrl?: string;
    capacity: number;
    spacesLeft: number;
    subject?: { name: string; code: string };
    teacher?: { name: string; email: string; image: string };
}

export const RecommendationsVisualGrid = ({ data }: { data: RecommendationItem[] }) => {
	useDocumentTitle(`Recommended Classes ${APP_TITLE_SUFFIX}`);
    const getRagStyles = (strength: number) => {
        if (strength >= 80) {
            return "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400"; // RAG: Green (Strong Match)
        }
        if (strength >= 65) {
            return "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400";   // RAG: Amber (Medium Match)
        }
        return "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400";       // RAG: Red (Lower Match)
    };

    return (
        <div className="w-full space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {data.map((item) => {
                    const ragClass = getRagStyles(item.match_strength);
                    const status = item.status;
                    const statusVariant = status === "active" ? "default" : "secondary";

                    const isFull = item.spacesLeft <= 0;
                    const seatsUsed = item.capacity - item.spacesLeft;

                    const percentRemaining = (item.spacesLeft / item.capacity) * 100;
                    const isAlmostFull = percentRemaining < CLASS_CAPACITY_CONFIG.ALMOST_FULL_PERCENTAGE && !isFull;

                    return (
                        <div
                            key={item.id}
                            className={`group flex flex-col overflow-hidden rounded-xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                isFull
                                    ? "border-slate-200 bg-slate-50/50"
                                    : "border-slate-200/80 hover:border-slate-300"
                            }`}
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

                                {isFull ? (
                                    <div className="absolute left-3 top-3 inline-flex items-center rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs z-10">
                                        Class Full
                                    </div>
                                ) : isAlmostFull ? (
                                    <div className="absolute left-3 top-3 inline-flex items-center rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-xs z-10">
                                        Almost Full
                                    </div>
                                ) : null}

                                <div className={`absolute right-3 top-3 inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold shadow-xs backdrop-blur-md ${ragClass} z-10`}>
                                    <Sparkles className="mr-1 h-3 w-3" />
                                    {item.match_strength}% Match
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <Badge className=" h-5 self-start" variant={statusVariant}>{status.toUpperCase()}</Badge>

                                <h3 className="mt-1 text-base font-bold text-slate-900 line-clamp-1">
                                    {item.name || "Unassigned Class Name"}
                                </h3>

                                <p className="mt-1 text-xs font-normal text-slate-500 leading-relaxed line-clamp-2">
                                    {item.description}
                                </p>

                                <div className="mt-4 flex items-center gap-2">
                                    <Avatar className="size-7">
                                        {item.teacher?.image && (
                                            <AvatarImage src={item.teacher?.image} alt={item.teacher?.name} />
                                        )}
                                        <AvatarFallback>{getInitials(item.teacher?.name)}</AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col min-w-0 leading-tight">
                                        <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mb-0.5">
                                          Lecturer
                                        </span>
                                        <span className="text-xs font-semibold text-slate-800 truncate">
                                          {item.teacher?.name || "Teacher Unassigned"}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px] font-medium">
                                        <span className="text-slate-500">Available Seats</span>
                                        <span className={`font-semibold ${
                                            isFull ? "text-rose-600 font-bold" : isAlmostFull ? "text-amber-600 font-semibold" : "text-slate-700"
                                        }`}>
                                        {isFull ? "0 spaces left" : `${item.spacesLeft} / ${item.capacity} remaining`}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 rounded-full ${
                                                isFull
                                                    ? "bg-rose-500"
                                                    : isAlmostFull
                                                        ? "bg-amber-500"
                                                        : "bg-emerald-500"
                                            }`}
                                            style={{ width: `${Math.min((seatsUsed / item.capacity) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="my-4 border-t border-slate-100" />

                                <div className="mt-auto flex items-end justify-between gap-2">
                                    <div className="flex flex-col text-[10px] font-mono text-slate-400">
                                        {
                                            item.subject?.name ? (
                                                <Badge variant="secondary" className="whitespace-nowrap">{item.subject.name}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-[11px] pb-1">(Subject Unknown)</span>
                                            )
                                        }
                                    </div>

                                    <ShowButton
                                        resource="classes"
                                        recordItemId={item.id}
                                        variant={isFull ? "outline" : "default"}
                                        size="sm"
                                        className="h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        View Class
                                    </ShowButton>

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
    const apiBaseUrl = dataProvider.getApiUrl();
    useDocumentTitle(`Class Recommendations ${APP_TITLE_SUFFIX}`);

    const { query } = useCustom<RecommendationItem[]>({
        url: `${apiBaseUrl}classes/recommendations`,
        method: "get",
        queryOptions: {
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
                resource="class-recommendations"
            />

            <div className="space-y-6 mt-1">
                <p className="text-muted-foreground text-sm">
                    Consider these classes, popular with students matching your academic profile.
                </p>

                {recommendations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-xl bg-slate-50/50">
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">
                            No recommended classes available
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                            Please join at least one class.<br/><br/>Once we have suitable data from other students available we will present your personalised recommendations here
                        </p>
                    </div>
                ) : (
                    <RecommendationsVisualGrid data={recommendations} />
                )}
            </div>
        </ListView>
    );
};

export default RecommendedClassList;
