import { useDocumentTitle } from "@refinedev/react-router";
import {APP_TITLE_SUFFIX} from "@/constants";
import {
    Search,
    MoreHorizontal,
    Eye,
    LogOut,
    Sparkles,
    ArrowRight,
    X
} from "lucide-react";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";

import {useIsMobile} from "@/hooks/use-mobile";
import {Button} from "@/components/ui/button";

import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

import { useNavigate } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchInput } from "@/components/search-input";

export const RecommendationsBanner = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <Alert className="relative mb-6 flex items-start justify-between border border-primary/20 bg-primary/5 p-4 pr-12 shadow-none transition-all dark:bg-primary/10">
            <div className="flex gap-3">
                <div className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                    <AlertTitle className="text-sm font-semibold text-foreground tracking-tight">
                        Looking for your next class?
                    </AlertTitle>
                    <AlertDescription className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        We’ve analysed your current academic choices for class options matching similar students. Take a look at your top recommendations.
                    </AlertDescription>
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <Button
                    variant="link"
                    size="sm"
                    className="h-8 gap-1 p-0 font-semibold text-primary hover:text-primary/80 text-xs"
                    onClick={() => navigate("/classes/recommendations")}
                >
                    <span>View Recommendations</span>
                    <ArrowRight className="h-3 w-3" />
                </Button>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 text-muted-foreground/60 hover:bg-primary/10 hover:text-foreground hidden"
                onClick={() => setIsVisible(false)}
            >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Dismiss banner</span>
            </Button>

        </Alert>
    );
};

type EnrolmentListItem = {
    id: number;
    status: "active" | "inactive";
    bannerUrl?: string;
    createdAt?: Date;
    classes?: {
        id: number;
        name: string;
        status: "active" | "inactive";
        bannerUrl?: string;
    };
    subjects?: {
        name: string;
    };
    teacher?: {
        name: string;
    };
};

//todo action-menu is not keyboard accessible currently, below block allows keyboard navigation but not selection and stops mouse selection! WIP...
// export function RowActionsCell({ enrollment }: any) {
//     const [open, setOpen] = useState(false);
//     const isMobile = useIsMobile();
//
//     const MenuItems = () => (
//         <>
//             <DropdownMenuItem
//                 asChild
//                 onSelect={() => setOpen(false)}
//             >
//                 <ShowButton
//                     resource="classes"
//                     recordItemId={enrollment.classes.id}
//                     className="w-full justify-start shadow-none bg-transparent text-foreground h-10 px-4 font-normal gap-2 border-0 outline-none cursor-pointer"
//                 >
//                     <Eye className="h-4 w-4 text-muted-foreground" />
//                     <span>View Class</span>
//                 </ShowButton>
//             </DropdownMenuItem>
//
//             <DropdownMenuItem
//                 asChild
//                 onSelect={() => setOpen(false)}
//             >
//                 <DeleteButton
//                     id={enrollment.id}
//                     resource="enrollments" // Explicitly target your table resource
//                     className="w-full justify-start shadow-none bg-transparent text-destructive hover:bg-destructive/10 h-10 px-4 font-normal gap-2 border-0 outline-none cursor-pointer"
//                     >
//                     <LogOut className="h-4 w-4" />
//                     <span>Leave Class</span>
//                 </DeleteButton>
//             </DropdownMenuItem>
//         </>
//     );
//
//     if (isMobile) {
//         return (
//             <Drawer open={open} onOpenChange={setOpen}>
//                 <DrawerTrigger asChild>
//                     <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
//                         <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
//                     </Button>
//                 </DrawerTrigger>
//                 <DrawerContent className="p-4 pb-6">
//                     <DrawerHeader className="text-left px-0 pt-0 pb-4">
//                         <DrawerTitle>Class Options</DrawerTitle>
//                         <DrawerDescription>Manage your current schedule settings.</DrawerDescription>
//                     </DrawerHeader>
//                     <div className="flex flex-col gap-2">
//                         <MenuItems />
//                     </div>
//                 </DrawerContent>
//             </Drawer>
//         );
//     }
//
//     return (
//         <DropdownMenu open={open} onOpenChange={setOpen}>
//             <DropdownMenuTrigger asChild>
//                 <Button variant="ghost"
//                         className="h-8 w-8 p-0 focus:outline-none focus-visible:bg-muted focus-visible:text-accent-foreground focus-visible:ring-0"
//      >
//                     <span className="sr-only">Open menu</span>
//                     <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
//                 </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-44 p-1 flex flex-col gap-0.5">
//                 <MenuItems />
//             </DropdownMenuContent>
//         </DropdownMenu>
//     );
// }

export function RowActionsCell({ enrollment }: any) {
    const [open, setOpen] = useState(false);
    const isMobile = useIsMobile();

    const MenuItems = () => (
        <>
            <ShowButton
                resource="classes"
                recordItemId={enrollment.classes.id}
                meta={{
                    onClick: () => setOpen(false)
                }}
                className="w-full justify-start shadow-none bg-transparent hover:bg-muted text-foreground h-10 px-4 font-normal gap-2 border-0 outline-none cursor-pointer"
            >
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>View Class</span>
            </ShowButton>

            {/*todo - tbc why the below confirm-* props are complaining? Use defaults for now*/}
            <DeleteButton
                recordItemId={enrollment.id}
                resource="enrollments"
                //confirmTitle="Leave this class?"
                // confirmMessage="Are you sure you want to remove yourself from this layout schedule?"
                // confirmOkText="Yes, Leave"
                // confirmCancelText="Cancel"
                className="w-full justify-start shadow-none bg-transparent text-destructive hover:text-destructive hover:bg-destructive/10 h-10 px-4 font-normal gap-2 border-0 outline-none cursor-pointer"
            >
                <LogOut className="h-4 w-4" />
                <span>Leave Class</span>
            </DeleteButton>

        </>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="p-4 pb-6">
                    <DrawerHeader className="text-left px-0 pt-0 pb-4">
                        <DrawerTitle>Class Options</DrawerTitle>
                        <DrawerDescription>Manage your current schedule settings.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex flex-col gap-2">
                        <MenuItems />
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 focus:outline-none focus-visible:bg-muted focus-visible:text-accent-foreground focus-visible:ring-0"
                >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 p-1 flex flex-col gap-0.5">
                <MenuItems />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


const EnrolmentList = () => {
  useDocumentTitle(`My Classes ${APP_TITLE_SUFFIX}`);

    /*this block was to get the URL and Text of "All Classes" list screen, so it can be displayed if no records.
      fiddly, likely needs the data table overloaded to accept HTML so a button/link can be displayed, todo later

    const { menuItems } = useMenu();
    const classesItem = menuItems.find((item) => item.name === "classes");
    const { listUrl } = useNavigation();
    const allClassesLabel = classesItem?.label ?? "All Classes";
    const allClassesUrl = listUrl("classes");
    */

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

    const enrolmentColumns = useMemo<ColumnDef<EnrolmentListItem>[]>(
        () => [
            {
                id: "banner",
                accessorKey: "classes.bannerUrl",
                size: 60,
                header: () => <p className="column-title ml-2"></p>,
                cell: ({getValue}) => {
                    const bannerUrl = getValue<string>();

                    return bannerUrl ? (
                        <img
                            src={bannerUrl}
                            alt="Class banner"
                            className="ml-2 h-10 w-10 rounded-md object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <span className="text-muted-foreground ml-2">No image</span>
                    );
                },
            },
            {
                id: "name",
                accessorKey: "classes.name",
                size: 220,
                header: () => <p className="column-title">Class Name</p>,
                cell: ({getValue}) => (
                    <span className="text-foreground">{getValue<string>()}</span>
                ),
                filterFn: "includesString",
            },
            {
                id: "status",
                accessorKey: "classes.status",
                size: 140,
                header: () => <p className="column-title">Status</p>,
                cell: ({getValue}) => {
                    const status = getValue<"active" | "inactive">();
                    const variant = status === "active" ? "default" : "secondary";

                    return <Badge variant={variant}>{status}</Badge>;
                },
            },
            {
                id: "subject",
                accessorKey: "subjects.name",
                size: 200,
                header: () => <p className="column-title">Subject</p>,
                cell: ({getValue}) => {
                    const subjectName = getValue<string>();

                    return subjectName ? (
                        <Badge variant="secondary">{subjectName}</Badge>
                    ) : (
                        <span className="text-muted-foreground">Not set</span>
                    );
                },
            },
            {
                id: "teacher",
                accessorKey: "teacher.name",
                size: 200,
                header: () => <p className="column-title">Lecturer</p>,
                cell: ({getValue}) => {
                    const teacherName = getValue<string>();

                    return teacherName ? (
                        <span className="text-foreground">{teacherName}</span>
                    ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                    );
                },
            },
            {
                id: "createdAt",
                accessorKey: "createdAt",
                size: 200,
                header: () => <p className="column-title">Enrolment Date</p>,
                cell: ({ row }) => {
                    const rawDate = row.original?.createdAt;
                    if (!rawDate) return <span className="text-muted-foreground">-</span>;
                    const dateObj = new Date(rawDate);
                    const formattedDate = new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }).format(dateObj);
                    return <span>{formattedDate}</span>;
                },
            },
            {
                id: "rowActions",
                accessorKey: "rowActions",
                header: () => <p className="column-title text-left">Actions</p>,
                cell: ({ row }) => {
                    const enrollmentRow = row.original;

                    return (
                        <div className="text-left pl-1">
                            <RowActionsCell enrollment={enrollmentRow} />
                        </div>
                    );
                },
            },

        ],
        []
    );

  const searchFilters = searchQuery
    ? [
        {
          field: "name",
          operator: "contains" as const,
          value: searchQuery,
        },
      ]
    : [];

  const enrolmentTable = useTable<EnrolmentListItem>({
    columns: enrolmentColumns,
    refineCoreProps: {
      resource: "enrollments",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      filters: {
        permanent: [...searchFilters],
      },
      sorters: {
        initial: [
          {
            field: "name",
            order: "desc",
          },
        ],
      },
    },
  });

    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">My Classes</h1>
            <div className="intro-row">
                <p>Classes you have enrolled in</p>
                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon" />
                        <SearchInput
                            placeholder="Search name or subject..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onDebouncedChange={setSearchQuery}
                        />
                    </div>
                </div>
            </div>

            <div className="w-full">
                <RecommendationsBanner />
            </div>

            <DataTable
                table={enrolmentTable}
                emptyTitle="You haven't joined any classes yet"
                emptyDescription="Any classes you join will be visible here"
            />
        </ListView>
    );

};

export default EnrolmentList;
