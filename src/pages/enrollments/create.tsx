import { useDocumentTitle } from "@refinedev/react-router";
import { APP_TITLE_SUFFIX } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { useBack, useOne, type BaseRecord, type HttpError } from "@refinedev/core";
import { useParams } from "react-router";
import * as z from "zod";

import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import {Card, CardTitle} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormField } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

// Core Form Validation Schema
const enrollmentSchema = z.object({
  classId: z.number().positive("Valid Class ID is required"),
});
type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

const EnrollmentsCreate = () => {
  useDocumentTitle(`Join a class ${APP_TITLE_SUFFIX}`);
  const back = useBack();

  const { id } = useParams();
  const targetClassId = Number(id) || 0;

  const { query: classQuery } = useOne({
    resource: "classes",
    id: targetClassId,
    queryOptions: {
      enabled: targetClassId > 0,
    },
  });

  const classDetails = classQuery.data?.data ?? null;
  const isClassLoading = classQuery.isLoading;

  const form = useForm<BaseRecord, HttpError, EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    refineCoreProps: {
      resource: "enrollments",
      action: "create",
      redirect: "list",
    },
    defaultValues: {
      classId: targetClassId,
    },
  });

  const {
    refineCore: { onFinish },
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = form;

  const onSubmit = async (values: EnrollmentFormValues) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error joining class:", error);
    }
  };

  const teacherName = classDetails?.teacher?.name ?? "Unknown";

  return (
      <CreateView className="class-view class-show">
        <Breadcrumb />

        <h1 className="page-title">Confirm Enrolment</h1>
        <div className="intro-row">
          <p>Please review the below information before confirming your enrolment.</p>
          <Button onClick={() => back()}>Go Back</Button>
        </div>

        <Separator />

        <div className="my-4 w-full">
          {isClassLoading || !classDetails ? (
              <div className="space-y-4 py-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full mt-6" />
              </div>
          ) : (
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <FormField
                      control={control}
                      name="classId"
                      render={({ field }) => (
                          <input type="hidden" {...field} value={targetClassId} />
                      )}
                  />

                  <Card className="details-card">
                    <div>
                      <div className="details-header">
                        <div>
                          <CardTitle>You are joining class</CardTitle>
                          <h1>{classDetails.name}</h1>
                        </div>

                        <div className="flex items-center gap-2">
                        </div>
                      </div>

                      <div className="details-grid flex flex-row flex-wrap gap-x-12 gap-y-6 items-start">

                        <div className="department flex flex-col leading-normal min-w-[200px] max-w-xs">
                          <p>🏛️ Department</p>
                          <div>
                            <p>{classDetails?.department?.name || ""}</p>
                            <p>{""}</p>
                          </div>
                        </div>

                        <div className="subject flex flex-col leading-normal min-w-[200px] max-w-xs">
                          <p>📚 Subject</p>
                          <div>
                            <p>{classDetails?.subject?.name || ""}</p>
                            <p>{""}</p>
                          </div>
                        </div>

                        <div className="instructor flex flex-col leading-normal min-w-[200px] max-w-xs">
                          <p>👨‍🏫 Lecturer</p>
                          <div>
                            <div>
                              <p>{teacherName}</p>
                              <p>{""}</p>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    <Separator />

                    <div className="join space-y-4">
                      <h2>📋 Expectations & Guidelines</h2>

                      <div className="space-y-4 mt-2">

                        <div className="flex items-start gap-3">
                          <span className="text-base font-bold text-slate-400 select-none mt-0.5">•</span>
                          <p className="m-0 leading-relaxed">
                            <strong>Attendance Monitoring:</strong> You agree to maintain regular attendance across all scheduled lecture and seminar slots. Attendance is strictly monitored by the faculty and must not drop below expected university standards.
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="text-base font-bold text-slate-400 select-none mt-0.5">•</span>
                          <p className="m-0 leading-relaxed">
                            <strong>Independent Study:</strong> In alignment with university guidelines, this module requires independent preparation. You are expected to complete all assigned weekly readings and review seminar briefs ahead of each scheduled session.
                          </p>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="text-base font-bold text-slate-400 select-none mt-0.5">•</span>
                          <p className="m-0 leading-relaxed">
                            <strong>Course Changes & Withdrawals:</strong> By confirming your place, you are registering an active seat on this class. Please discuss with your Lecturer before leaving a class, and refer to your university handbook for more details regarding enrolment regulations.
                          </p>
                        </div>

                      </div>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full font-semibold"
                        disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enrolling..." : "Confirm & Join Class"}
                    </Button>
                  </Card>
                </form>
              </Form>
          )}
        </div>
      </CreateView>
  );
};

export default EnrollmentsCreate;
