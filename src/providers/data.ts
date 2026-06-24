import {createDataProvider, CreateDataProviderOptions} from "@refinedev/rest";

import { CreateResponse, GetOneResponse, ListResponse } from "@/types";
import {BACKEND_BASE_URL} from "@/constants";
import { HttpError } from "@refinedev/core";

if (!BACKEND_BASE_URL)
  throw new Error("BACKEND_BASE_URL is not configured. Please set VITE_BACKEND_BASE_URL in your .env file");

// Reusable helper to intercept errors before any parsing happens
const checkResponseError = async (response: Response): Promise<void> => {
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as any;

    let defaultMessage = "An unexpected error occurred.";
    if (response.status === 401) defaultMessage = "Unauthorised: No active user session found, please login";
    if (response.status === 403) defaultMessage = "Access Denied: This resource is not available for your user profile.";

    const httpError: HttpError = {
      message: body?.message || body?.error || defaultMessage,
      statusCode: response.status,
      errors: body?.errors || {}, // Keeps form field validations working automatically
    };

    throw httpError;
  }
};

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,

    buildQueryParams: async ({ resource, pagination, filters }) => {
      const params: Record<string, string | number> = {};

      if (pagination?.mode !== "off") {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

        params.page = page;
        params.limit = pageSize;
      }

      filters?.forEach((filter) => {
        const field = "field" in filter ? filter.field : "";
        const value = String(filter.value);

        if (field === "role") {
          params.role = value;
        }

        if (resource === "departments") {
          if (field === "name" || field === "code") params.search = value;
        }

        if (resource === "users") {
          if (field === "search" || field === "name" || field === "email") {
            params.search = value;
          }
        }

        if (resource === "subjects") {
          if (field === "department") params.department = value;
          if (field === "name" || field === "code") params.search = value;
        }

        if (resource === "classes") {
          if (field === "name") params.search = value;
          if (field === "subject") params.subject = value;
          if (field === "teacher") params.teacher = value;
        }

        if (resource === "enrollments") {
          if (field === "name") params.search = value;
        }
      });

      return params;
    },

    mapResponse: async (response): Promise<any> => {
      await checkResponseError(response);
      const payload: ListResponse = await response.json();
      return payload.data ?? [];
    },

    getTotalCount: async (response) => {
      // If a 403 occurred, the stream is broken, return 0 to prevent crashes (todo, should this be != 200 ?)
      if (response.status === 401 || response.status === 403) return 0;
      const payload: ListResponse = await response.json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    },
  },

  create: {
    getEndpoint: ({ resource }) => resource,

    buildBodyParams: async ({ variables }) => variables,

    mapResponse: async (response) => {
      await checkResponseError(response);
      const json: CreateResponse = await response.json();
      return json.data ?? {};
    },
  },

  getOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,

    mapResponse: async (response) => {
      await checkResponseError(response);
      const json: GetOneResponse = await response.json();
      return json.data ?? {};
    },
  },

  custom: {
    // Refine passes the final URL string directly to the custom method.
    // custom method so far only used by enrolment-recommendations
    // buildQueryParams - disabled for now, but enable & test below code if future components require this

    // buildQueryParams: async ({ filters }) => {
    //   const params: Record<string, string | number> = {};
    //
    //   filters?.forEach((filter) => {
    //     const field = "field" in filter ? filter.field : "";
    //     const value = String(filter.value);
    //     if (field === "req_max_records") params.req_max_records = value;
    //   });
    //
    //   return params;
    // },

    mapResponse: async (response) => {
      await checkResponseError(response);
      const json = await response.json() as { data?: any };

      // Symmetrically returns the data property expected by Refine hooks
      return {
        data: json.data ?? {},
      };
    },
  },







  // custom: async ({ url, method, payload, headers }) => {
  //   // Direct fetch execution bypassing filter parsing loops
  //   const response = await fetch(url, {
  //     method: method.toUpperCase(),
  //     headers: {
  //       "Content-Type": "application/json",
  //       ...headers,
  //     },
  //     // Only pass body strings on payload-driven requests (like POST or PUT)
  //     body: payload ? JSON.stringify(payload) : undefined,
  //   });
  //
  //   if (!response.ok) {
  //     throw new Error(`Custom request failed with status: ${response.status}`);
  //   }
  //
  //   const json = await response.json();
  //
  //   return {
  //     data: json.data,
  //   };
  //},
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };