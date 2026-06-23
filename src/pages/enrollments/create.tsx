import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreate, useGetIdentity, useList } from "@refinedev/core";
import { useNavigate } from "react-router";

import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {ClassDetails, Subject, User} from "@/types";
import {Search} from "lucide-react";
import {DEPARTMENT_OPTIONS} from "@/constants";
import {CreateButton} from "@/components/refine-ui/buttons/create.tsx";
import {DataTable} from "@/components/refine-ui/data-table/data-table.tsx";
import {ListView} from "@/components/refine-ui/views/list-view.tsx";
import {useTable} from "@refinedev/react-table";
import {useMemo} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge.tsx";
import {ShowButton} from "@/components/refine-ui/buttons/show.tsx";

/* test recommendations-code */
import React, { useEffect } from "react";
import { useCustom } from "@refinedev/core";

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

export const EnrollmentsPage = () => {
  // 1. Destructure "query" directly from useCustom (matches Refine's design pattern)
  const { query } = useCustom<RecommendationItem[]>({
    url: "http://localhost:8000/api/enrollments/recommendations",
    method: "get",
  });

  // 2. Safely read your data array from query.data.data
  //const recommendationsList = query.data?.data ?? [];
  //const recommendationsList = query.data?.data?.data ?? [];
  const recommendationsList = query.data?.data?.data ?? [];

  // 3. Extract the clean reactive loading/error states natively
  const isLoading = query.isLoading;
  const error = query.error;

  useEffect(() => {
    if (!isLoading && !error) {
      console.log("--- REFINE CUSTOM HOOK COMPLETELY VERIFIED ---");
      console.log("Recommendations List:", recommendationsList);
    }
  }, [recommendationsList, isLoading, error]);

  if (isLoading) return <div>Loading recommendations from data provider...</div>;
  if (error) return <div>Failed to load recommendations.</div>;

  return (
      <div>
        <h1>Enrollments Dashboard</h1>
        <p>Successfully passed compilation! Items found: {recommendationsList.length}</p>
        <ul>
          {recommendationsList.map((rec) => (
              <li key={rec.id}>
                Class ID: {rec.classId} | Match Strength: {rec.match_strength}%
              </li>
          ))}
        </ul>
      </div>
  );
};

/* test recommendations-code */

const enrollSchema = z.object({
  classId: z.coerce.number().min(1, "Class is required"),
});

type EnrollFormValues = z.infer<typeof enrollSchema>;

const EnrollmentsCreate = () => {
  const navigate = useNavigate();
  const {
    mutateAsync: createEnrollment,
    mutation: { isPending },
  } = useCreate();
  const { data: currentUser } = useGetIdentity<User>();

  const { query: classesQuery } = useList<ClassDetails>({
    resource: "classes",
    pagination: {
      pageSize: 100,
    },
  });

  const classes = classesQuery.data?.data ?? [];
  const classesLoading = classesQuery.isLoading;

  const form = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollSchema),
    defaultValues: {
      classId: 0,
    },
  });

  const selectedClassId = form.watch("classId");

  const onSubmit = async (values: EnrollFormValues) => {
    if (!currentUser?.id) return;

    const response = await createEnrollment({
      resource: "enrollments",
      values: {
        classId: values.classId,
        studentId: currentUser.id,
      },
    });

    navigate("/enrollments/confirm", {
      state: {
        enrollment: response?.data,
      },
    });
  };

  const isSubmitDisabled =
    isPending ||
    classesLoading ||
    !currentUser?.id ||
    !classes.length ||
    !selectedClassId;

  /*
  BELOW Extra code to first get subjects table working, then adjust for recommendations
   */

  const subjectColumns = useMemo<ColumnDef<Subject>[]>(
      () => [
        {
          id: "code",
          accessorKey: "code",
          size: 100,
          header: () => <p className= "column-title ml-2">Code</p>,
          cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
        },
        {
          id: "name",
          accessorKey: "name",
          size: 200,
          header: () => <p className= "column-title">Name</p>,
          cell: ({ getValue }) => (
              <span className="text-foreground">{getValue<string>()}</span>
          ),
          filterFn: "includesString",
        },
        {
          id: "department",
          accessorKey: "department.name",
          size: 150,
          header: () => <p className= "column-title">Department</p>,
          cell: ({ getValue }) => (
              <Badge variant="secondary">{getValue<string>()}</Badge>
          ),
        },
        {
          id: "description",
          accessorKey: "description",
          size: 300,
          header: () => <p className= "column-title">Description</p>,
          cell: ({ getValue }) => (
              <span className="truncate line-clamp-2">{getValue<string>()}</span>
          ),
        },
        {
          id: "details",
          size: 140,
          header: () => <p className="column-title">Details</p>,
          cell: ({ row }) => (
              <ShowButton
                  resource="subjects"
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

  const subjectTable = useTable<Subject>({
    columns: subjectColumns,
    refineCoreProps: {
      resource: "subjects",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      // filters: {
      //   // Compose refine filters from the current UI selections.
      //   permanent: [...departmentFilters, ...searchFilters],
      // },
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

  /*
  ABOVE Extra code to first get subjects table working, then adjust for recommendations
   */

  /*
 BELOW Extra code to first get recommendations working
  */

  type ClassRecommendationListItem = {
    id: number;
    name: string;
    status: "active" | "inactive";
    // bannerUrl?: string;
    subject?: {
      name: string;
    };
    // teacher?: {
    //   name: string;
    // };
    // capacity: number;
  };

  const classRecommendationColumns = useMemo<ColumnDef<ClassRecommendationListItem>[]>(
      () => [
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
        }
      ],
      []
  );

  const classRecommendationTable = useTable<ClassRecommendationListItem>({
    columns: classRecommendationColumns,
    refineCoreProps: {
      resource: "classes",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      // filters: {
      //   // Compose refine filters from the current UI selections.
      //   permanent: [...departmentFilters, ...searchFilters],
      // },
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

  /*
 ABOVE Extra code to first get recommendations working
  */


  return (
    <CreateView className="class-view">
      <Breadcrumb />

      <h1 className="page-title">Enrol in a Class</h1>
      <div className="intro-row">
        <p>Select a class to enrol as the current user.</p>
      </div>

      <Separator />

      <div className="my-4 flex items-center">
        <Card className="class-form-card">
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
              Enrolment Form
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="mt-7">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Class <span className="text-orange-600">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? String(field.value) : ""}
                        disabled={classesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((classItem) => (
                            <SelectItem
                              key={classItem.id}
                              value={String(classItem.id)}
                            >
                              {classItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <FormControl>
                    <Input
                      value={currentUser?.email ?? "Not signed in"}
                      readOnly
                    />
                  </FormControl>
                </FormItem>

                <Button type="submit" size="lg" disabled={isSubmitDisabled}>
                  {isPending ? "Enroling..." : "Enrol"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <ListView>
          <div className="intro-row">
            <p>Quick access to essential metrics and management tools.</p>
          </div>

          <DataTable table={subjectTable} />
        </ListView>
      </div>

      <Separator />

      <div>
        <ListView>
          <div className="intro-row">
            <p>Quick access to essential metrics and management tools.</p>
          </div>

          <DataTable table={classRecommendationTable} />
        </ListView>
      </div>

    </CreateView>
  );
};

export default EnrollmentsCreate;
