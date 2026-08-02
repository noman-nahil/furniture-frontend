export type CategoryNav = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  subcategories?: {
    _id: string;
    name: string;
    slug: string;
  }[];
};
