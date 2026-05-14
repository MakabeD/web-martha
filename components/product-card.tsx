import Image from "next/image";
import { motion } from "framer-motion";

type ProductCardProps = {
  id: string;
  nombre: string;
  precio: string;
  categoria: string;
  imagen: string;
  onClick: () => void;
};

export default function ProductCard({
  id,
  nombre,
  precio,
  categoria,
  imagen,
  onClick,
}: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel-strong)] text-left shadow-[var(--shadow)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(7,7,5,0.12)]"
    >
      <motion.div
        layoutId={`image-${id}`}
        className="relative aspect-[4/5] overflow-hidden bg-[color:var(--surface-strong)]"
      >
        <Image
          src={imagen}
          alt={nombre}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(7,7,5,0.2)] to-transparent" />
      </motion.div>

      <div className="space-y-3 p-5">
        <motion.p
          layoutId={`categoria-${id}`}
          className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--accent)]"
        >
          {categoria}
        </motion.p>
        <motion.h2
          layoutId={`nombre-${id}`}
          className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--primary)]"
        >
          {nombre}
        </motion.h2>
        <div className="flex items-center justify-between gap-4">
          <motion.p
            layoutId={`precio-${id}`}
            className="text-lg font-medium text-[color:var(--ink)]"
          >
            {precio}
          </motion.p>
          <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
            Eliza
          </span>
        </div>
        <p className="text-sm leading-6 text-[color:var(--ink)]/65">
          Pieza seleccionada para un catalogo visual limpio y facil de explorar.
        </p>
      </div>
    </button>
  );
}
