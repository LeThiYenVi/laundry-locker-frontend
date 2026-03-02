// ============================================
// Admin Feedback & Report Management Types
// Based on: AdminFeedbackController, AdminReportController, AdminAnalyticsController
// ============================================

// ─── Feedback ────────────────────────────────────────────────────────────────

export interface FeedbackDTO {
  id: number;
  userId: number;
  userName: string;
  email: string;
  rating: number; // 1-5
  comment: string;
  relatedOrderId: number | null;
  orderDescription: string | null;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackDetailDTO {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  rating: number;
  comment: string;
  relatedOrderId: number | null;
  serviceType: string | null;
  orderAmount: number | null;
  adminReply: string | null;
  repliedAt: string | null;
  resolvedBy: string | null; // Admin name
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFeedbackStatusRequest {
  status: string; // "REVIEWED" | "RESOLVED"
}

export interface ReplyFeedbackRequest {
  reply: string;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export type ReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type ReportCategory =
  | "DAMAGED"
  | "LOST"
  | "QUALITY"
  | "BILLING"
  | "OTHER";
export type ResolutionType = "REFUND" | "REPLACEMENT" | "DISCOUNT" | "OTHER";

export interface ReportDTO {
  id: number;
  userId: number;
  userName: string;
  email: string;
  category: ReportCategory;
  title: string;
  description: string;
  status: ReportStatus;
  relatedOrderId: number | null;
  assignedStaffId: number | null;
  assignedStaffName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportNoteDTO {
  id: number;
  adminName: string;
  noteText: string;
  createdAt: string;
}

export interface ReportDetailDTO {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  category: ReportCategory;
  title: string;
  description: string;
  attachmentUrls: string[];
  status: ReportStatus;
  assignedStaffId: number | null;
  assignedStaffName: string | null;
  internalNotes: ReportNoteDTO[];
  resolution: string | null;
  resolutionType: ResolutionType | null;
  compensationAmount: number | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportStatsDTO {
  totalReports: number;
  openReports: number;
  inProgressReports: number;
  resolvedReports: number;
  reportsByCategory: Record<ReportCategory, number>;
  averageResolutionTime: number; // hours
  resolutionRate: number; // percentage
  reportsByStaff: Record<string, number>;
}

export interface UpdateReportStatusRequest {
  status: ReportStatus;
}

export interface AssignReportRequest {
  staffId: number;
}

export interface AddNoteRequest {
  note: string;
}

export interface ResolveReportRequest {
  resolution: string;
  resolutionType: ResolutionType;
  compensationAmount: number;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface FeedbackTrendDTO {
  date: string;
  count: number;
  avgRating: number;
}

export interface FeedbackAnalyticsDTO {
  averageRating: number;
  totalFeedback: number;
  ratingDistribution: Record<string, number>; // {"5": 450, "4": 280, ...}
  feedbackToday: number;
  feedbackThisWeek: number;
  feedbackThisMonth: number;
  trends: FeedbackTrendDTO[];
  unresolvedCount: number;
}

export interface SatisfactionMetricsDTO {
  overallSatisfactionScore: number; // 0-100
  npsScore: number;
  positivePercentage: number; // % of 4-5 ratings
  negativePercentage: number; // % of 1-2 ratings
  mostCommonComplaint: string;
  topServiceQuality: string;
  departmentScores: Record<string, number>;
}
