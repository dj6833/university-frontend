import { useDocumentTitle } from "@refinedev/react-router";
import { APP_TITLE_SUFFIX } from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { useBack, useOne, type BaseRecord, type HttpError } from "@refinedev/core";
import * as z from "zod";

import { useParams } from "react-router";

// Maintaining 100% identical styling tokens from your core views
import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormField } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

// 1. Simplified Zod Schema: No text inputs required, we just validate the hidden parameter
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
      enabled: targetClassId > 0, // Only runs if a valid ID exists in the URL parameters
    },
  });

  const classDetails = classQuery.data?.data ?? null;
  const isClassLoading = classQuery.isLoading;

  // 4. Initialize your standard Refine hook form layout
  const form = useForm<BaseRecord, HttpError, EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    refineCoreProps: {
      resource: "enrollments",
      action: "create",
      redirect: "list", // Seamlessly bounces the student to their schedule upon completion
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
      // Fires native onFinish mutation payload exactly like your other pages
      await onFinish(values);
    } catch (error) {
      console.error("Error joining class:", error);
    }
  };

  return (
      <CreateView className="class-view">
        <Breadcrumb />

        {/* Symmetrical Title Elements */}
        <h1 className="page-title">Confirm Enrolment</h1>
        <div className="intro-row">
          <p>Please review the class information below before finalizing your registration place.</p>
          <Button onClick={() => back()}>Go Back</Button>
        </div>

        <Separator />

        <div className="my-4 flex items-center">
          <Card className="class-form-card">
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
                Review & Join
              </CardTitle>
            </CardHeader>

            <Separator />

            <CardContent className="mt-7">
              {isClassLoading ? (
                  // Clean layout skeletons matching your standard view properties while loading
                  <div className="space-y-4 py-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full mt-6" />
                  </div>
              ) : (
                  <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                      {/* Hidden tracking field holds our classId securely */}
                      <FormField
                          control={control}
                          name="classId"
                          render={({ field }) => (
                              <input type="hidden" {...field} value={targetClassId} />
                          )}
                      />

                      {/* 🌟 THE PASSTHROUGH PREVIEW PRESENTATION: Displays key meta info */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2">
                        <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase font-mono">
                          {classDetails?.subject?.code || "COURSE DETAILS"}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">
                          {classDetails?.name || "Unassigned Class Name"}
                        </h2>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {classDetails?.description || "No class description provided."}
                        </p>
                        <div className="text-xs font-medium text-slate-600 pt-2 border-t border-slate-100 mt-2">
                          <span className="text-slate-400 font-normal">Lecturer:</span> {classDetails?.teacher?.name || "Not assigned"}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        By clicking confirm, you will be instantly added to the class list and allocate one place from the total room capacity.
                      </p>

                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || targetClassId === 0}>
                        {isSubmitting ? "Enrolling..." : "Confirm & Join Class"}
                      </Button>
                    </form>
                  </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </CreateView>
  );
};

export default EnrollmentsCreate;



//old page
// /*
// page not linked to in app, likely will be removed once user can join classes through a better method
//  */
// import { useDocumentTitle } from "@refinedev/react-router";
// import {APP_TITLE_SUFFIX} from "@/constants";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import { useCreate, useGetIdentity, useList } from "@refinedev/core";
// import { useNavigate } from "react-router";
//
// import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
// import { CreateView } from "@/components/refine-ui/views/create-view";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {ClassDetails, User} from "@/types";


// const enrollSchema = z.object({
//   classId: z.coerce.number().min(1, "Class is required"),
// });
//
// type EnrollFormValues = z.infer<typeof enrollSchema>;
//
// const EnrollmentsCreate = () => {
//   useDocumentTitle(`Enrol in a Class ${APP_TITLE_SUFFIX}`);
//   const navigate = useNavigate();
//   const {
//     mutateAsync: createEnrollment,
//     mutation: { isPending },
//   } = useCreate();
//   const { data: currentUser } = useGetIdentity<User>();
//
//   const { query: classesQuery } = useList<ClassDetails>({
//     resource: "classes",
//     pagination: {
//       pageSize: 100,
//     },
//   });
//
//   const classes = classesQuery.data?.data ?? [];
//   const classesLoading = classesQuery.isLoading;
//
//   const form = useForm<EnrollFormValues>({
//     resolver: zodResolver(enrollSchema),
//     defaultValues: {
//       classId: 0,
//     },
//   });
//
//   const selectedClassId = form.watch("classId");
//
//   const onSubmit = async (values: EnrollFormValues) => {
//     if (!currentUser?.id) return;
//
//     const response = await createEnrollment({
//       resource: "enrollments",
//       values: {
//         classId: values.classId,
//         studentId: currentUser.id,
//       },
//     });
//
//     navigate("/enrollments/confirm", {
//       state: {
//         enrollment: response?.data,
//       },
//     });
//   };
//
//   const isSubmitDisabled =
//     isPending ||
//     classesLoading ||
//     !currentUser?.id ||
//     !classes.length ||
//     !selectedClassId;
//
//   return (
//     <CreateView className="class-view">
//       <Breadcrumb />
//
//       <h1 className="page-title">Enrol in a Class</h1>
//       <div className="intro-row">
//         <p>Select a class to enrol as the current user.</p>
//       </div>
//
//       <Separator />
//
//       <div className="my-4 flex items-center">
//         <Card className="class-form-card">
//           <CardHeader className="relative z-10">
//             <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
//               Enrolment Form
//             </CardTitle>
//           </CardHeader>
//
//           <Separator />
//
//           <CardContent className="mt-7">
//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit(onSubmit)}
//                 className="space-y-5"
//               >
//                 <FormField
//                   control={form.control}
//                   name="classId"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>
//                         Class <span className="text-orange-600">*</span>
//                       </FormLabel>
//                       <Select
//                         onValueChange={(value) => field.onChange(Number(value))}
//                         value={field.value ? String(field.value) : ""}
//                         disabled={classesLoading}
//                       >
//                         <FormControl>
//                           <SelectTrigger className="w-full">
//                             <SelectValue placeholder="Select a class" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {classes.map((classItem) => (
//                             <SelectItem
//                               key={classItem.id}
//                               value={String(classItem.id)}
//                             >
//                               {classItem.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//
//                 <FormItem>
//                   <FormLabel>Student</FormLabel>
//                   <FormControl>
//                     <Input
//                       value={currentUser?.email ?? "Not signed in"}
//                       readOnly
//                     />
//                   </FormControl>
//                 </FormItem>
//
//                 <Button type="submit" size="lg" disabled={isSubmitDisabled}>
//                   {isPending ? "Enroling..." : "Enrol"}
//                 </Button>
//               </form>
//             </Form>
//           </CardContent>
//         </Card>
//       </div>
//
//     </CreateView>
//   );
// };
//
// export default EnrollmentsCreate;
