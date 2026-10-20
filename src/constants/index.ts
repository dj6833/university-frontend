import * as z from "zod";
import { GraduationCap, School } from "lucide-react";

export const USER_ROLES = {
    STUDENT: "student",
    TEACHER: "teacher",
    ADMIN: "admin",
};

export const ROLE_OPTIONS = [
    {
        value: USER_ROLES.STUDENT,
        label: "Student",
        icon: GraduationCap,
    },
    {
        value: USER_ROLES.TEACHER,
        label: "Teacher",
        icon: School,
    },
];

export const DEPARTMENTS = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
    "Economics",
    "Business Administration",
    "Engineering",
    "Psychology",
    "Sociology",
    "Political Science",
    "Philosophy",
    "Education",
    "Fine Arts",
    "Music",
    "Physical Education",
    "Law",
] as const;

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
    value: dept,
    label: dept,
}));

export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
export const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
];

export const CLASS_CAPACITY_CONFIG = {
    ALMOST_FULL_PERCENTAGE: 20, // The percentage threshold below which a class flags an "Almost Full" warning state
} as const;

export const UI_LABELS = {
    [USER_ROLES.TEACHER]: "Lecturer",
    [USER_ROLES.STUDENT]: "Student",
    [USER_ROLES.ADMIN]: "Administrator",
} as const;

//validation checks for any env vars can be added here
const envSchema = z.object({
    // Strict Toggle: Must be exactly "true" or "false"
    //VITE_IS_LOCAL: z.enum(["true", "false"]).transform((val) => val === "true"),
    VITE_BACKEND_BASE_URL: z.string().url()
});

const parsedSchema = envSchema.safeParse(import.meta.env);

if (!parsedSchema.success) {
    // Prints every config error at once in the terminal
    console.error("Environment configuration failed:", parsedSchema.error.format());
    throw new Error("Unable to start app due to invalid environment variables");
}

// When running locally, use relative URLs to leverage Vite proxy (same-origin, avoids cross-site cookie blocking seen with certain browsers/browser modes)
//const isLocal = parsedSchema.data.VITE_IS_LOCAL

const getEnvVar = (key: string): string => {
    const value = import.meta.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};
export const CLOUDINARY_UPLOAD_URL = getEnvVar("VITE_CLOUDINARY_UPLOAD_URL");
export const CLOUDINARY_CLOUD_NAME = getEnvVar("VITE_CLOUDINARY_CLOUD_NAME");

// Default to calling api route on the same origin for local development
// export const BACKEND_BASE_URL = isLocal
//     ? `${window.location.origin}/api/`
//     : parsedSchema.data.VITE_BACKEND_BASE_URL

export const BACKEND_BASE_URL = `${window.location.origin}/api/`;

export const BACKEND_ANALYSIS_SERVICE_URL = getEnvVar("VITE_BACKEND_ANALYSIS_SERVICE_URL");
export const APP_TITLE_SUFFIX = import.meta.env.VITE_APP_TITLE_SUFFIX;
export const CLOUDINARY_UPLOAD_PRESET = getEnvVar("VITE_CLOUDINARY_UPLOAD_PRESET") ;
