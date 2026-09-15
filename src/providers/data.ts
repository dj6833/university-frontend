import {createDataProvider, CreateDataProviderOptions} from "@refinedev/rest";

import {CreateResponse, DeleteResponse, GetOneResponse, ListResponse} from "@/types";
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

  deleteOne: {
    getEndpoint: ({resource, id}) => `${resource}/${id}`,
    mapResponse: async (response) => {
      await checkResponseError(response);
      const json: DeleteResponse = await response.json();
      return json.data ?? {};
    },
  },

  custom: {

    mapResponse: async (response) => {
      await checkResponseError(response);
      const json = await response.json() as { data?: any };
      return {
        data: json.data ?? {},
      };
    },
  },
  
};

// Generate your core base provider using your configuration options
const { dataProvider: baseDataProvider } = createDataProvider(BACKEND_BASE_URL, options);

// 1. Session flag tracking ensures the loop only fires once per browser instance tab
let isWarmupTriggered = false;

const triggerInfrastructureWarmup = (): void => {
  if (isWarmupTriggered) return;
  isWarmupTriggered = true;

  console.log("Refine Core Network Layer: Dispatched backend infrastructure warmup sequence.");

  // Cleanly extract the base domain and append the health path securely
  const baseApiUrl = BACKEND_BASE_URL.replace(/\/$/, "");
  const targetWarmupUrl = `${baseApiUrl}/health/warmup`;

  console.log(`Routing warmup execution directly to backend gateway: ${targetWarmupUrl}`);

  fetch(targetWarmupUrl, {
    method: "GET",
    mode: "no-cors"
  }).catch(() => {
    // Safely swallow initial connection drops
  });
};

// 2. Wrap the base provider methods to cleanly execute the initialization trigger
const dataProvider = {
  ...baseDataProvider,

  getList: async (params: any) => {
    triggerInfrastructureWarmup();
    return baseDataProvider.getList(params);
  },

  getOne: async (params: any) => {
    triggerInfrastructureWarmup();
    return baseDataProvider.getOne(params);
  },

  create: async (params: any) => {
    triggerInfrastructureWarmup();
    return baseDataProvider.create(params);
  },

  update: async (params: any) => {
    triggerInfrastructureWarmup();
    return baseDataProvider.update(params);
  },

  deleteOne: async (params: any) => {
    triggerInfrastructureWarmup();
    return baseDataProvider.deleteOne(params);
  },

  // Ensures any non-CRUD custom routing triggers also evaluate container readiness
  custom: async (params: any) => {
    triggerInfrastructureWarmup();
    return baseDataProvider.custom!(params);
  }
};

// 3. Export the custom wrapper object so App.tsx loads it automatically without changes
export { dataProvider };