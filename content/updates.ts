export type CompanyUpdate = {
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  paragraphs: string[];
};

// Add a real, approved announcement here when there is something meaningful to publish.
// The list is intentionally empty rather than inventing company milestones.
export const updates: CompanyUpdate[] = [];
