import Link from "next/link";
import CatalogBrowser from "@/components/catalog-browser";
import { getProducts } from "@/lib/products";

export const metadata = {
  title: "Catalogo de eliza",
  description: ".",
};

export default async function CatalogoPage() {
  const { products, source } = await getProducts();

  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--primary)]">
              Eliza
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[color:var(--ink)] sm:text-5xl">
              Catalogo
            </h1>
          </div>

          <Link
            href="/"
            className="inline-flex rounded-full border border-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-[color:var(--primary)] transition hover:bg-[color:var(--primary)] hover:text-[color:var(--surface)]"
          >
            Volver
          </Link>
        </div>

        {source === "fallback" ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[color:var(--primary)]/40 bg-white/70 px-5 py-4 text-sm text-[color:var(--ink)]/80">
            Mostrando productos de ejemplo. Para usar Google Sheets, agrega
            `GOOGLE_SHEET_CSV_URL` o `GOOGLE_SHEET_ID` en tus variables de
            entorno.
          </div>
        ) : null}
        <CatalogBrowser products={products} />
      </div>
    </main>
  );
}
