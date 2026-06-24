import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { CreateButton } from "@/components/refine-ui/buttons/create";

type EnrolmentListItem = {
    id: number;
    status: "active" | "inactive";
    bannerUrl?: string;
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

const EnrolmentList = () => {
  const [searchQuery, setSearchQuery] = useState("");

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
                header: () => <p className="column-title">Teacher</p>,
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
                id: "details",
                size: 140,
                header: () => <p className="column-title">Details</p>,
                cell: ({row}) => (
                    <ShowButton
                        resource="classes"
                        recordItemId={row.original.classes?.id}
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
      <h1 className="page-title">Enrolments</h1>

      <div className="intro-row">
        <p>Quick access to essential metrics and management tools.</p>

        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search name or subject..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <CreateButton resource="enrollments" />
        </div>
      </div>

      <DataTable table={enrolmentTable} />
    </ListView>
  );
};

export default EnrolmentList;
