/**
 * Enlaces de afiliado. Mientras `url` sea null el sitio no muestra ningún botón ni aviso de afiliación:
 * cuando David consiga el enlace de un programa, basta con ponerlo aquí y aparece solo en los sitios
 * que usan `AfiliadoCTA.astro` (el aviso de transparencia de `ArticleMeta` se activa con `hayAfiliado`).
 */
export interface Afiliado {
  nombre: string;
  /** Enlace de afiliado tal como lo da el programa. null = todavía sin programa. */
  url: string | null;
  texto: string;
}

export const AFILIADOS = {
  myinvestor: {
    nombre: 'MyInvestor',
    url: null,
    texto: 'Abrir cuenta en MyInvestor',
  },
} satisfies Record<string, Afiliado>;

export type ClaveAfiliado = keyof typeof AFILIADOS;

export const hayAfiliado = (clave: ClaveAfiliado): boolean => Boolean(AFILIADOS[clave].url);
