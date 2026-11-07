export type ReviewStatus = 'todo' | 'done';

export type ReviewItem = {
  id: string;
  browser_id: string;
  title: string;
  details: string;
  review_date: string | null;
  action: string;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
};

export type ReviewForm = {
  title: string;
  details: string;
  reviewDate: string;
  action: string;
};

export type GuidanceItem = {
  id: string;
  label: string;
  service: string;
  category: string;
  href: string;
};
