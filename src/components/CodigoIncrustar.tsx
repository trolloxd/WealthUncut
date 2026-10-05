import { useState } from 'react';

interface Props {
  slug: string;
  nombre: string;
  href: string;
  altura: number;
  origen: string;
}

/** Bloque "Incrusta esta herramienta en tu web": código de iframe más un enlace de atribución. */
export default function CodigoIncrustar({ slug, nombre, href, altura, origen }: Props) {
  const [aviso, setAviso] = useState('');
  const codigo =
    `<iframe src="${origen}/embed/${slug}/" title="${nombre}" width="100%" height="${altura}" ` +
    `style="border:0;max-width:100%" loading="lazy"></iframe>\n` +
    `<p><a href="${origen}${href}">${nombre}: herramienta gratuita de WealthUncut</a></p>`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setAviso('Código copiado.');
    } catch {
      setAviso('Selecciona el texto y cópialo.');
    }
  }

  return (
    <details className="card not-prose p-5">
      <summary className="cursor-pointer font-display text-lg text-ink">Incrusta esta herramienta en tu web</summary>
      <p className="mt-3 text-sm text-ink-muted">
        Es gratuita. Pega este código en tu página o blog y tus lectores podrán usarla sin salir de ahí.
        Déjalo tal cual, con el enlace de debajo, que indica de dónde viene.
      </p>
      <textarea
        readOnly
        rows={5}
        value={codigo}
        onFocus={(e) => e.currentTarget.select()}
        className="campo-input mt-3 font-mono text-xs"
        aria-label={`Código para incrustar ${nombre}`}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button type="button" onClick={copiar} className="btn-secondary text-sm">
          Copiar código
        </button>
        <span className="text-xs text-ink-faint" role="status" aria-live="polite">
          {aviso}
        </span>
      </div>
    </details>
  );
}
