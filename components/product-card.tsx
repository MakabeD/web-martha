import Image from "next/image";

type ProductCardProps = {
  nombre: string;
  precio: string;
  categoria: string;
  imagen: string;
};

export default function ProductCard({
  nombre,
  precio,
  categoria,
  imagen,
}: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-[color:var(--primary)]/12 bg-white shadow-[0_18px_45px_rgba(7,7,5,0.08)]">
      <div className="relative aspect-[4/5] bg-[color:var(--surface-strong)]">
        <Image
          src={imagen}
          alt={nombre}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <div className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--primary)]">
          {categoria}
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--ink)]">
          {nombre}
        </h2>
        <p className="text-lg font-medium text-[color:var(--primary)]">
          {precio}
        </p>
      </div>
    </article>
  );
}
