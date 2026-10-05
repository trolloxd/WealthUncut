import catalogo from '../../data/myinvestor-fondos/catalogo.json';

// Catálogo completo de fondos de MyInvestor para el buscador de /carteras/. Se publica como JSON
// estático y la isla lo pide solo cuando se usa el buscador, para no cargar ~170 KB en cada visita.
export function GET() {
  return new Response(JSON.stringify(catalogo), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
