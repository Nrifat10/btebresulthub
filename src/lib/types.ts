export type ReferredSubject = { code: number; type: string }; // "T" | "P" | "T,P" | "C"

export type ResultStatus = "passed" | "referred";

/** One row in the `results` collection: one roll number inside one published PDF. */
export type ResultDoc = {
  roll: number;
  curriculumId: string;
  regulation: number | null;
  semester: number;
  instituteCode: number | null;
  status: ResultStatus;
  gpa: number | null;
  cgpa: number | null;
  referred: ReferredSubject[];
  date: string; // publication date, YYYY-MM-DD
  fileName: string;
  fileHash: string;
};

/** One row in the `publications` collection: one published PDF file. */
export type PublicationDoc = {
  fileName: string;
  fileHash: string;
  date: string;
  curriculumId: string;
  regulation: number | null;
  semester: number;
  stats: { total: number; passed: number; referred: number };
  instituteCount: number;
  sourceUrl?: string;
};

export type InstituteDoc = { code: number; name: string; district: string | null };

export type SemesterResultItem = {
  date: string;
  fileName: string;
  fileHash: string;
  semester: number;
  instituteCode: number | null;
  gpa: number | null;
  cgpa: number | null;
  referred: ReferredSubject[];
  status: ResultStatus;
};

export type StudentResult = {
  roll: number;
  curriculumId: string;
  regulation: number | null;
  institute: InstituteDoc | null;
  currentFailedSubjects: ReferredSubject[];
  semesterResults: { semester: number; status: ResultStatus; results: SemesterResultItem[] }[];
  latestResults: SemesterResultItem[];
};

export type PublicationGroup = {
  date: string;
  files: PublicationDoc[];
  stats: { total: number; passed: number; referred: number };
  curricula: string[];
  semesters: number[];
};

export type InstituteResultRow = {
  roll: number;
  status: ResultStatus;
  gpa: number | null;
  cgpa: number | null;
  referred: ReferredSubject[];
};

export type ApiOk<T> = { success: true; data: T };
export type ApiErr = { success: false; error: string };
export type ApiResponse<T> = ApiOk<T> | ApiErr;
