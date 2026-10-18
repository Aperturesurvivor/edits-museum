export type EditStatus = "unscreened" | "flagged_review" | "flagged_medium" | "hand_kept" | "approved_by_josiah" | "approved";

/** X CDN MP4 URLs (video.twimg.com). Streamed directly by the browser; never downloaded or re-hosted. */
export type VideoSources = { hi: string; lo: string | null };

export type Edit = {
  id: string;
  url: string;
  author: string;
  authorName: string;
  /** Stored for screening/genre tagging only. Never render this. */
  caption: string;
  createdAt: string | null;
  likes: number;
  bookmarks: number;
  views: number;
  videoViews: number;
  durationS: number | null;
  mediaType: string | null;
  thumb: string | null;
  width: number | null;
  height: number | null;
  video: VideoSources | null;
  genre: string | null;
  /** Primary wing. */
  wing: string;
  /** Every wing this edit is listed in (primary + weight >= 0.5). Set by visual review. */
  wings?: string[];
  /** 0-1 relevance per wing from visual review. */
  weights?: Record<string, number>;
  subject: string;
  status: EditStatus;
  source: string;
};

/** Caption-free projection: the only shape that may reach client components. */
export type PublicEdit = Omit<Edit, "caption" | "subject" | "genre" | "source" | "weights">;

export type Submission = {
  id: string;
  author: string;
  url: string;
  wing: string | null;
  status: "pending";
  submittedAt: string;
};
