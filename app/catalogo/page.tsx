import Link from "next/link";
import CatalogBrowser from "@/components/catalog/catalog-browser";
import { getProducts } from "@/lib/catalog/products";

export const metadata = {
  title: "Catalogo de eliza",
  description: ".",
};

export default async function CatalogoPage() {
  const { products, source } = await getProducts();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[1.75rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-7 lg:rounded-[2rem] lg:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[color:var(--accent)]">
                Eliza
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--primary)] sm:text-5xl lg:text-6xl">
                Catalogo
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--ink)]/70 sm:text-base">
                Descubre la coleccion, filtra por categoria, busca por nombre y
                ordena cada pieza a tu manera.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex rounded-full border border-[color:var(--line-strong)] bg-[color:var(--panel-strong)] px-5 py-3 text-sm font-semibold text-[color:var(--primary)] transition duration-300 hover:-translate-y-0.5 hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-[color:var(--surface)]"
            >
              Volver
            </Link>
          </div>
        </div>

        {source === "fallback" ? (
          <div className="mt-6 rounded-[1.35rem] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--panel-strong)] px-4 py-4 text-sm leading-7 text-[color:var(--ink)]/78 shadow-[0_10px_30px_rgba(7,7,5,0.04)] sm:mt-8 sm:px-5">
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
