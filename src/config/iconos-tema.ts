// Color de fondo de cada icono de tema (GlifoTema, IconoTema e IlustracionTema). Tonos suaves de la paleta; las
// criptomonedas van sobre tinta porque su icono tiene piezas claras.
const FONDOS: Record<string, string> = {
  'fondos-indexados': '#e3ece4',
  impuestos: '#f6e3de',
  vivienda: '#e3ece4',
  autonomos: '#efe8d8',
  criptomonedas: '#1c1b17',
  jubilacion: '#f6e3de',
  trabajo: '#efe8d8',
  ahorro: '#e3ece4',
};

export function fondoTema(tema: string): string {
  return FONDOS[tema] ?? FONDOS.ahorro;
}
