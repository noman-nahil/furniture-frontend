export type CategoryNav = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  /** When false, omit from navbar. Missing means shown (legacy docs). */
  showInNavbar?: boolean;
  subcategories?: {
    _id: string;
    name: string;
    slug: string;
  }[];
};
