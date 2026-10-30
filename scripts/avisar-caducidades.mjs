// Punto de entrada del prebuild: muestra el registro de caducidades antes de `npm run build`.
// Un fallo al cargar el comprobador (sintaxis, Node antiguo...) nunca debe parar un build normal; solo con
// FRESCURA_ESTRICTA=1 se sale con error. Los datos vencidos críticos paran el build únicamente en modo estricto.
process.argv.push('--solo-registro');
try {
  await import('./comprobar-frescura.mjs');
} catch (e) {
  const primera = String(e.message).split('\n')[0];
  console.warn(`[caducidades] no se pudo mostrar el registro: ${primera}`);
  if (process.env.FRESCURA_ESTRICTA === '1') process.exit(2);
}
