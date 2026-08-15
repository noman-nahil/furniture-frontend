import { permanentRedirect } from "next/navigation";

/** Old WordPress shop URL. Middleware also redirects /shop and /shop/*. */
export default function ShopAliasPage() {
  permanentRedirect("/products");
}
