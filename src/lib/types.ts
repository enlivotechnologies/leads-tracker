export type Designation =
  | "PRINCIPAL"
  | "VICE_PRINCIPAL"
  | "PLACEMENT_OFFICER"
  | "CSR_COORDINATOR"
  | "OTHER";

export type CallType = "FIRST_CALL" | "FOLLOW_UP";

export type ResponseStatus = "INTERESTED" | "CALL_LATER" | "NOT_INTERESTED";

export interface Lead {
  id: string;
  employeeId: string;
  date: string;
  collegeName: string;
  location: string | null;
  contactPerson: string | null;
  designation: Designation | null;
  phone: string | null;
  callType: CallType;
  slotRequested: boolean;
  slotDate: string | null;
  followUpDate?: string | null;
  followUpDone?: boolean;
  responseStatus: ResponseStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormData {
  collegeName: string;
  location?: string;
  contactPerson?: string;
  designation?: Designation;
  phone?: string;
  callType: CallType;
  slotRequested: boolean;
  slotDate?: string;
  responseStatus: ResponseStatus;
  remarks?: string;
}

export const DESIGNATION_OPTIONS: { value: Designation; label: string }[] = [
  { value: "PRINCIPAL", label: "Principal" },
  { value: "VICE_PRINCIPAL", label: "Vice Principal" },
  { value: "PLACEMENT_OFFICER", label: "Placement Officer" },
  { value: "CSR_COORDINATOR", label: "CSR Coordinator" },
  { value: "OTHER", label: "Other" },
];

export const CALL_TYPE_OPTIONS: { value: CallType; label: string }[] = [
  { value: "FIRST_CALL", label: "First Call" },
  { value: "FOLLOW_UP", label: "Follow-up" },
];

export const RESPONSE_STATUS_OPTIONS: {
  value: ResponseStatus;
  label: string;
}[] = [
  { value: "INTERESTED", label: "Interested" },
  { value: "CALL_LATER", label: "Call Later" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
];
