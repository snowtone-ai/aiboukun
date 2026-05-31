export type GoogleAccount = {
  name: string;
  accountName?: string;
  type?: string;
  verificationState?: string;
};

export type GoogleLocation = {
  name: string;
  title?: string;
  storeCode?: string;
  metadata?: {
    placeId?: string;
    mapsUri?: string;
    newReviewUri?: string;
  };
  profile?: {
    description?: string;
  };
};

export type GoogleReview = {
  name: string;
  reviewId?: string;
  reviewer?: {
    displayName?: string;
    profilePhotoUrl?: string;
  };
  starRating?: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime?: string;
  updateTime?: string;
  reviewReply?: {
    comment?: string;
    updateTime?: string;
  };
};

export type GoogleListResponse<T> = {
  items: T[];
  nextPageToken?: string;
};

export type GoogleApiErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "RATE_LIMITED" | "GOOGLE_API_ERROR";

export class GoogleApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: GoogleApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GoogleApiError";
  }
}

export function googleRatingToNumber(rating?: GoogleReview["starRating"]) {
  switch (rating) {
    case "ONE":
      return 1;
    case "TWO":
      return 2;
    case "THREE":
      return 3;
    case "FOUR":
      return 4;
    case "FIVE":
      return 5;
    default:
      return 0;
  }
}
