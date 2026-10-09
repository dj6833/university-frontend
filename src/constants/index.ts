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

export const DOCUMENT_TYPES = {
    STUDENT_WELCOME_PACK: "student_welcome_pack",
} as const;

export const DOCUMENT_OPTIONS = [
    {
        value: DOCUMENT_TYPES.STUDENT_WELCOME_PACK,
        label: "Student Welcome Pack",
    },
] as const;

// Helper lookup map to allow instant label translation inside list table cell grids
export const DOCUMENT_LABEL_MAP: Record<string, string> = Object.fromEntries(
    DOCUMENT_OPTIONS.map((opt) => [opt.value, opt.label])
);

export const DOCUMENT_STATUS = {
    PENDING: "pending",
    PROCESSING: "processing",
    COMPLETED: "completed",
    FAILED: "failed",
} as const;

const getEnvVar = (key: string): string => {
    const value = import.meta.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};
export const CLOUDINARY_UPLOAD_URL = getEnvVar("VITE_CLOUDINARY_UPLOAD_URL");
export const CLOUDINARY_CLOUD_NAME = getEnvVar("VITE_CLOUDINARY_CLOUD_NAME");
export const BACKEND_BASE_URL = getEnvVar("VITE_BACKEND_BASE_URL");
export const BACKEND_ANALYSIS_SERVICE_URL = getEnvVar("VITE_BACKEND_ANALYSIS_SERVICE_URL");
export const APP_TITLE_SUFFIX = getEnvVar("VITE_APP_TITLE_SUFFIX");
export const CLOUDINARY_UPLOAD_PRESET = getEnvVar("VITE_CLOUDINARY_UPLOAD_PRESET") ;