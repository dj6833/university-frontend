import { useDocumentTitle } from "@refinedev/react-router";
import {APP_TITLE_SUFFIX, CLASS_CAPACITY_CONFIG} from "@/constants";
import {Search} from "lucide-react";
import {useMemo, useState} from "react";
import { ColumnDef } from "@tanstack/react-table";
import {useTable} from "@refinedev/react-table";
import {useList} from "@refinedev/core";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListView } from "@/components/refine-ui/views/list-view";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";

import { Subject, User } from "@/types";

type ClassListItem = {
  id: number;
  name: string;
  status: "active" | "inactive";
  bannerUrl?: string;
  subject?: {
    name: string;
  };
  teacher?: {
    name: string;
  };
  capacity: number;
  spacesLeft: number;
};

const ClassesList = () => {
    useDocumentTitle(`Classes ${APP_TITLE_SUFFIX}`);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState<string>("all");
    const [selectedTeacher, setSelectedTeacher] = useState<string>("all");

  const classColumns = useMemo<ColumnDef<ClassListItem>[]>(
        () => [
            {
        id: "banner",
                accessorKey: "bannerUrl",
        size: 60,
                header: () => <p className="column-title ml-2"></p>,
        cell: ({ getValue }) => {
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
                accessorKey: "name",
        size: 220,
                header: () => <p className="column-title">Class Name</p>,
        cell: ({ getValue }) => {
          const className = getValue<string>();

          return <span className="text-foreground">{className}</span>;
        },
            },
            {
        id: "status",
        accessorKey: "status",
        size: 140,
                header: () => <p className="column-title">Status</p>,
                cell: ({ getValue }) => {
          const status = getValue<"active" | "inactive">();
          const variant = status === "active" ? "default" : "secondary";

          return <Badge variant={variant}>{status}</Badge>;
        },
            },
            {
                id: "subject",
                accessorKey: "subject.name",
        size: 200,
                header: () => <p className="column-title">Subject</p>,
        cell: ({ getValue }) => {
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
                header: () => <p className="column-title">Teacher</p>,
        cell: ({ getValue }) => {
          const teacherName = getValue<string>();

          return teacherName ? (
            <span className="text-foreground">{teacherName}</span>
          ) : (
            <span className="text-muted-foreground">Not assigned</span>
          );
        },
            },
            //displays availability as "33 / 33 spaces" available
            // {
            //     id: "availability",
            //     // We bind the baseline key tracker to the numeric spacesLeft parameter
            //     accessorKey: "spacesLeft",
            //     size: 200,
            //     header: () => <p className="column-title">Availability</p>,
            //     cell: ({ row }) => {
            //         const record = row.original;
            //         const displaySpacesLeft = Math.max(0, record.spacesLeft ?? 0);
            //         const isFull = (record.spacesLeft ?? 0) <= 0;
            //         const percentRemaining = (displaySpacesLeft / (record.capacity ?? 1)) * 100;
            //         const isAlmostFull = percentRemaining < CLASS_CAPACITY_CONFIG.ALMOST_FULL_PERCENTAGE && !isFull;
            //
            //         return (
            //                 <span className={`"text-foreground" ${
            //                     isFull
            //                         ? "text-rose-600"
            //                         : isAlmostFull
            //                             ? "text-amber-600"
            //                             : "text-slate-800"
            //                 }`}>
            //                 {`${displaySpacesLeft} / ${record.capacity}  spaces`}
            //                 </span>
            //
            //         );
            //     },
            // },
            {
                id: "availability",
                accessorKey: "spacesLeft",
                size: 180, // Optimized width for a table-cell progress bar
                header: () => <p className="column-title">Availability</p>,
                cell: ({ row }) => {
                    const record = row.original;
                    const displaySpacesLeft = Math.max(0, record.spacesLeft ?? 0);
                    const capacity = record.capacity ?? 1;
                    const seatsUsed = capacity - displaySpacesLeft;
                    const isFull = (record.spacesLeft ?? 0) <= 0;
                    const percentRemaining = (displaySpacesLeft / capacity) * 100;
                    const isAlmostFull = percentRemaining < CLASS_CAPACITY_CONFIG.ALMOST_FULL_PERCENTAGE && !isFull;
                    const fillPercent = Math.min((seatsUsed / capacity) * 100, 100);

                    return (
                        <div className="flex flex-col justify-center space-y-1.5 w-full max-w-[150px] py-1">
                            <div className="flex items-center justify-between text-[11px] font-medium leading-none">
                              <span className={
                                  isFull
                                      ? "text-rose-600 font-bold"
                                      : isAlmostFull
                                          ? "text-amber-600 font-semibold"
                                          : "text-slate-600"
                              }>
                                {isFull ? "Full" : isAlmostFull ? "Almost Full" : "Available"}
                              </span>
                                <span className="text-slate-400 font-mono text-[10px]">
                                    {displaySpacesLeft}/{capacity}
                                  </span>
                            </div>
                            <div
                                className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/20"
                                title={`${displaySpacesLeft} out of ${capacity} spaces remaining`}
                            >
                                <div
                                    className={`h-full transition-all duration-500 rounded-full ${
                                        isFull
                                            ? "bg-rose-500"
                                            : isAlmostFull
                                                ? "bg-amber-500"
                                                : "bg-emerald-500"
                                    }`}
                                    style={{ width: `${fillPercent}%` }}
                                />
                            </div>
                        </div>
                    );
                },
            },
            {
                id: "details",
                size: 140,
                header: () => <p className="column-title">Details</p>,
        cell: ({ row }) => (
          <ShowButton
            resource="classes"
            recordItemId={row.original.id}
            variant="outline"
            size="sm"
          >
            View
                </ShowButton>
        ),
      },
        ],
        []
    );

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: {
      pageSize: 100,
    },
  });

  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "teacher",
      },
    ],
    pagination: {
      pageSize: 100,
    },
  });

  const subjects = subjectsQuery.data?.data || [];
  const teachers = teachersQuery.data?.data || [];

  const subjectFilters =
    selectedSubject === "all"
      ? []
      : [
          {
            field: "subject",
            operator: "eq" as const,
            value: selectedSubject,
          },
        ];

  const teacherFilters =
    selectedTeacher === "all"
      ? []
      : [
          {
            field: "teacher",
            operator: "eq" as const,
            value: selectedTeacher,
          },
        ];

  const searchFilters = searchQuery
    ? [
        {
          field: "name",
          operator: "contains" as const,
          value: searchQuery,
        },
      ]
    : [];

  const classesTable = useTable<ClassListItem>({
        columns: classColumns,
        refineCoreProps: {
      resource: "classes",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
            filters: {
        // Compose refine filters from the current UI selections.
        permanent: [...subjectFilters, ...teacherFilters, ...searchFilters],
            },
            sorters: {
                initial: [
          {
            field: "id",
            order: "desc",
          },
        ],
      },
    },
  });

    return (
        <ListView>
            <Breadcrumb />
      <h1 className="page-title">All Classes</h1>

            <div className="intro-row">
        <p>Explore which classes are available at our University</p>

                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon" />
                        <Input
                            type="text"
                            placeholder="Search by name ..."
                            className="pl-10 w-full"
                            value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full  sm:w-auto">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by subject" />
                            </SelectTrigger>

                            <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                                        {subject.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by teacher" />
                            </SelectTrigger>

                            <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.name}>
                    {teacher.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

            <CreateButton resource="classes" />
                    </div>
                </div>
            </div>

            <DataTable table={classesTable} />
        </ListView>
    );
};

export default ClassesList;
