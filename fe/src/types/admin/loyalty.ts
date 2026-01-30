import type { PointTransactionType, StampType } from './enums';

// ============================================
// Admin Loyalty Management Types
// ============================================

export interface PointsAccountResponse {
  id: number;
  userId: number;
  userName: string;
  pointsBalance: number;
  pointsValueVnd: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  totalAmountSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface StampCardResponse {
  id: number;
  userId: number;
  stampType: StampType;
  serviceId: number;
  serviceName: string;
  boxSize: string | null;
  stampsRequired: number;
  currentStamps: number;
  freeRewardsAvailable: number;
  totalStampsEarned: number;
  totalRewardsRedeemed: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltySummaryResponse {
  pointsAccount: PointsAccountResponse;
  stampCards: StampCardResponse[];
  totalRedeemableValue: number;
  totalFreeRewards: number;
}

export interface AdjustPointsRequest {
  userId: number;
  points: number;
  reason?: string;
}

export interface PointsTransactionResponse {
  id: number;
  userId: number;
  orderId: number | null;
  type: PointTransactionType;
  points: number;
  relatedAmount: number | null;
  balanceAfter: number;
  description: string;
  referenceId: string | null;
  createdAt: string;
}

export interface LoyaltyStatisticsResponse {
  totalMembers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalStampCards: number;
  totalRewardsRedeemed: number;
}
