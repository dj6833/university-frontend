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
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };



/*
// 1. Generate your standard base provider as you normally do
const { dataProvider: baseDataProvider } = createDataProvider(BACKEND_BASE_URL, options);

// 2. Wrap it to add the global error interceptor that Refine's hooks look for
const dataProvider = {
  ...baseDataProvider,
  onError: async (error: any) => {
    const { status } = error;

    // AUTOMATED LOGOUT BARRIER
    // If the server returns a 401, this exact payload signals Refine
    // to run your authProvider.logout() function, clearing localStorage automatically.
    if (status === 401) {
      return {
        message: "Your session has expired. Logging out...",
        statusCode: 401,
        redirectTo: "/login",
      };
    }

    // Let all other HTTP errors (like 500s or 400s) pass through normally
    return {
      message: error.message || "An unexpected error occurred.",
      statusCode: status,
    };
  },
};

export { dataProvider };
*/

/*
// const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);
// 1. Generate the standard provider from the factory as you normally do
const { dataProvider: baseDataProvider } = createDataProvider(BACKEND_BASE_URL, options);

// 2. Simply append the onError function to the exported object
const dataProvider = {
  ...baseDataProvider,
  onError: async (error: any) => {
    const { status, message } = error;

    if (status === 401 || status === 403) {
      return {
        message: message || "Access Denied: You do not have permission to view this resource",
        statusCode: status,
        redirectTo: status === 401 ? "/login" : undefined,
      };
    }

    return {
      message: message || "An unexpected error occurred.",
      statusCode: status,
    };
  },
};

export { dataProvider };
*/

/*
// 1. Generate the standard provider from the factory as you normally do
const { dataProvider: baseDataProvider } = createDataProvider(BACKEND_BASE_URL, options);

// 2. Intercept and wrap it in a custom object to inject 'credentials' globally
const dataProvider = {
  ...baseDataProvider,
  // This explicitly overrides custom network fetch calls (like React requests)
  custom: async ({ url, method, payload, headers }: any) => {
    const response = await fetch(url, {
      method: method.toUpperCase(),
      body: payload ? JSON.stringify(payload) : undefined,
      headers: { ...headers, "Content-Type": "application/json" },
      credentials: "include", // ◄ Tells fetch to append Better Auth cookies
    });
    return response.json();
  },
};

export { dataProvider };
*/