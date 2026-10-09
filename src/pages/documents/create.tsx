import { useDocumentTitle } from "@refinedev/react-router";
import {APP_TITLE_SUFFIX} from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { useBack, type BaseRecord, type HttpError } from "@refinedev/core";
import * as z from "zod";

import { CreateView } from "@/components/refine-ui/views/create-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DOCUMENT_OPTIONS, DOCUMENT_TYPES } from "@/constants";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

const documentSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

const DocumentsCreate = () => {
  useDocumentTitle(`Request a Document ${APP_TITLE_SUFFIX}`);
  const back = useBack();

  const form = useForm<BaseRecord, HttpError, DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    refineCoreProps: {
      resource: "documents",
      action: "create",
      redirect: "list",
      //Override generic fallback text with suitable wording
      successNotification: () => ({
          message: "Document requested",
          type: "success",
      }),
    },
    defaultValues: {
      documentType: "",
    },
  });

  const {
    refineCore: { onFinish },
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = form;

  const onSubmit = async (values: DocumentFormValues) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  return (
    <CreateView className="class-view">
      <Breadcrumb />

      <h1 className="page-title">Request a Document</h1>
      <div className="intro-row">
        <p>Provide the required information below to request a document</p>
        <Button onClick={() => back()}>Go Back</Button>
      </div>

      <Separator />

      <div className="my-4 flex items-center">
        <Card className="class-form-card">
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
              Select Document
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="mt-7">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                      control={control}
                      name="documentType"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>
                                  Document Type <span className="text-orange-600">*</span>
                              </FormLabel>
                              <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                              >
                                  <FormControl>
                                      <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select a Document Type" />
                                      </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                      {DOCUMENT_OPTIONS.map((document) => (
                                          <SelectItem
                                              key={document.value}
                                              value={document.value}
                                          >
                                              {document.label}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                      )}
                  />

                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Requesting..." : "Request Document"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </CreateView>
  );
};

export default DocumentsCreate;
