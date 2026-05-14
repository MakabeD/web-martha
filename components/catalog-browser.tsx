"use client";

import { useDeferredValue, useState } from "react";
import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/products";

type CatalogBrowserProps = {
  products: Product[];
};

type SortOption =
  | "nombre-asc"
  | "precio-asc"
  | "precio-desc"
  | "categoria-asc";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parsePrice(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}\b)/g, "");
  const withDecimalPoint = normalized.replace(",", ".");
  const parsed = Number(withDecimalPoint);

  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function CatalogBrowser({ products }: CatalogBrowserProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortBy, setSortBy] = useState<SortOption>("nombre-asc");
  const deferredSearch = useDeferredValue(search);

  const categories = [
    "Todas",
    ...Array.from(new Set(products.map((product) => product.categoria))).sort(
      (left, right) => left.localeCompare(right, "es"),
    ),
  ];

  const filteredProducts = products
    .filter((product) => {
      if (
        selectedCategory !== "Todas" &&
        product.categoria !== selectedCategory
      ) {
        return false;
      }

      if (!deferredSearch.trim()) {
        return true;
      }

      return normalizeText(product.nombre).includes(
        normalizeText(deferredSearch),
      );
    })
    .sort((left, right) => {
      switch (sortBy) {
        case "precio-asc":
          return parsePrice(left.precio) - parsePrice(right.precio);
        case "precio-desc":
          return parsePrice(right.precio) - parsePrice(left.precio);
        case "categoria-asc":
          return left.categoria.localeCompare(right.categoria, "es");
        case "nombre-asc":
        default:
          return left.nombre.localeCompare(right.nombre, "es");
      }
    });

  return (
    <>
      <section className="mt-10 grid gap-4 rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-5 shadow-[var(--shadow)] backdrop-blur sm:grid-cols-2 xl:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Buscar
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre"
            className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition duration-300 focus:border-[color:var(--accent)] focus:shadow-[0_0_0_4px_rgba(164,90,61,0.12)]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Categoria
          </span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition duration-300 focus:border-[color:var(--accent)] focus:shadow-[0_0_0_4px_rgba(164,90,61,0.12)]"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
            Ordenar por
          </span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition duration-300 focus:border-[color:var(--accent)] focus:shadow-[0_0_0_4px_rgba(164,90,61,0.12)]"
          >
            <option value="nombre-asc">Nombre</option>
            <option value="categoria-asc">Categoria</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </label>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-4 py-2 text-sm text-[color:var(--ink)]/78">
          {filteredProducts.length} producto
          {filteredProducts.length === 1 ? "" : "s"} encontrado
          {filteredProducts.length === 1 ? "" : "s"}
        </span>
        {selectedCategory !== "Todas" ? (
          <span className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-medium text-[color:var(--surface)]">
            {selectedCategory}
          </span>
        ) : null}
        {search.trim() ? (
          <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-4 py-2 text-sm text-[color:var(--accent)]">
            {search}
          </span>
        ) : null}
      </div>

      {filteredProducts.length === 0 ? (
        <section className="mt-8 rounded-[2rem] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--panel-strong)] px-6 py-12 text-center shadow-[0_10px_30px_rgba(7,7,5,0.04)]">
          <h2 className="text-2xl font-semibold text-[color:var(--primary)]">
            No encontramos productos
          </h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--ink)]/75">
            Prueba otra categoria, cambia el orden o busca con otro nombre.
          </p>
        </section>
      ) : (
        <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={`${product.nombre}-${product.precio}`}
              nombre={product.nombre}
              precio={product.precio}
              categoria={product.categoria}
              imagen={product.imagen}
            />
          ))}
        </section>
      )}
    </>
  );
}
