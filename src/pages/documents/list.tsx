import { useDocumentTitle } from "@refinedev/react-router";
import { APP_TITLE_SUFFIX, DOCUMENT_LABEL_MAP, DOCUMENT_STATUS, DOCUMENT_OPTIONS, BACKEND_BASE_URL } from "@/constants";
import { Search, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigation } from "@refinedev/core";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListView } from "@/components/refine-ui/views/list-view";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { SearchInput } from "@/components/search-input";

interface DocumentRecord {
    id: string;
    documentType: string;
    status: typeof DOCUMENT_STATUS[keyof typeof DOCUMENT_STATUS];
    createdAt: string;
}

const DocumentsListPage = () => {
    useDocumentTitle(`My Documents ${APP_TITLE_SUFFIX}`);
    const { create } = useNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDocType, setSelectedDocType] = useState<string>("all");
    const streamDocUrlPrefix =  `${BACKEND_BASE_URL}documents/`;
    const streamDocUrlSuffix = "/download"

    const documentColumns = useMemo<ColumnDef<DocumentRecord>[]>(
        () => [
            {
                id: "documentType",
                accessorKey: "documentType",
                size: 200,
                header: () => <p className="column-title ml-2">Document Type</p>,
                cell: ({ getValue }) => (
                    <span className="text-foreground font-semibold ml-2">
            {DOCUMENT_LABEL_MAP[getValue<string>()] || getValue<string>()}
          </span>
                ),
            },
            {
                id: "createdAt",
                accessorKey: "createdAt",
                size: 150,
                header: () => <p className="column-title">Requested</p>,
                cell: ({ getValue }) => {
                    const formatter = new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    });

                    return (
                        <span className="whitespace-nowrap">
                            {formatter.format(new Date(getValue<string>()))}
                        </span>
                    );
                },
            },
            {
                id: "status",
                accessorKey: "status",
                size: 150,
                header: () => <p className="column-title">Status Milestone</p>,
                cell: ({ getValue }) => {
                    const status = getValue<string>();

                    if (status === DOCUMENT_STATUS.COMPLETED) {
                        return <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 hover:bg-green-50">Completed</Badge>;
                    }
                    if (status === DOCUMENT_STATUS.FAILED) {
                        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-100 hover:bg-red-50">Failed</Badge>;
                    }

                    return (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 flex items-center gap-1.5 w-fit">
                            <svg className="animate-spin h-3 w-3 text-amber-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          {status === DOCUMENT_STATUS.PENDING ? "Queued" : "In Progress"}
                        </Badge>
                    );
                },
            },
            {
                id: "actions",
                size: 180,
                header: () => <p className="column-title">Actions</p>,
                cell: ({ row }) => {
                    const doc = row.original;

                    if (doc.status === DOCUMENT_STATUS.COMPLETED) {
                        return (
                            <div
                                className="flex gap-2 pr-4"
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild //Allows the button to cleanly adopt the HTML anchor capabilities natively
                                >
                                    <a
                                        href={`${streamDocUrlPrefix}${doc.id}${streamDocUrlSuffix}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View
                                    </a>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <a
                                        href={`${streamDocUrlPrefix}${doc.id}${streamDocUrlSuffix}?mode=download`}
                                        rel="noreferrer"
                                    >
                                        Download
                                    </a>
                                </Button>
                            </div>
                        );
                    }

                    if (doc.status === "failed") {
                        return (
                            <div className="flex items-center justify-end pr-4">
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-orange-600 hover:text-orange-700 font-bold text-xs uppercase tracking-wider p-0 h-auto"
                                    onClick={() => create("documents")}
                                >
                                    Retry
                                </Button>
                            </div>
                        );
                    }

                    return (
                        <div className="flex items-center justify-end pr-4">
                            {/*<span className="text-muted-foreground text-xs italic">Loading...</span>*/}
                        </div>
                    );
                },
            },
        ],
        [create]
    );

    const docTypeFilters =
        selectedDocType === "all"
            ? []
            : [
                {
                    field: "documentType",
                    operator: "eq" as const,
                    value: selectedDocType,
                },
            ];

    // ready for adding text search filtering down the road
    const searchFilters = searchQuery
        ? [
            {
                field: "documentType",
                operator: "contains" as const,
                value: searchQuery,
            },
        ]
        : [];

    const documentTable = useTable<DocumentRecord>({
        columns: documentColumns,
        refineCoreProps: {
            resource: "documents",
            pagination: {
                pageSize: 10,
                mode: "server",
            },
            filters: {
                permanent: [...docTypeFilters, ...searchFilters],
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

    const isFetching = documentTable.refineCore.tableQuery.isFetching;
    const handleRefresh = () => documentTable.refineCore.tableQuery.refetch();

    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">My Documents</h1>

            <div className="intro-row">
                <p>Directory of your personal university documents</p>

                <div className="actions-row">
                    <div className="search-field">
                        <Search className="search-icon" />
                        <SearchInput
                            placeholder="Search documents..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onDebouncedChange={setSearchQuery}
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isFetching}
              className={isFetching ? "animate-spin-slow" : ""}
              title="Refresh ledger state"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

                        <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                            <SelectTrigger className="">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {DOCUMENT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <CreateButton resource="documents">
                            Request Document
                        </CreateButton>
                    </div>
                </div>
            </div>

            <DataTable table={documentTable} />
        </ListView>
    );
};

export default DocumentsListPage;
