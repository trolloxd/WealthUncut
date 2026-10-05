// Añade una instantánea de las TAE al histórico (src/data/cuentas-remuneradas/historico.json).
//
// Uso: node scripts/historico-cuentas.mjs [ruta-a-un-ultimo.json]
// Sin argumentos lee src/data/cuentas-remuneradas/ultimo.json. Una instantánea por fecha: si ya
// existe una con la misma fecha, no hace nada (así se puede ejecutar varias veces sin duplicar).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ultimoRuta = process.argv[2] ?? 'src/data/cuentas-remuneradas/ultimo.json';
const historicoRuta = 'src/data/cuentas-remuneradas/historico.json';

const ultimo = JSON.parse(readFileSync(ultimoRuta, 'utf8'));
const historico = existsSync(historicoRuta)
  ? JSON.parse(readFileSync(historicoRuta, 'utf8'))
  : {
      nota: 'Una instantánea por fecha de actualización de las TAE de cuentas y depósitos publicadas en el comparador. Los datos de cada instantánea son los de ultimo.json en ese momento.',
      snapshots: [],
    };

if (historico.snapshots.some((s) => s.fecha === ultimo.fecha)) {
  console.log(`Ya existe la instantánea del ${ultimo.fecha}: nada que hacer.`);
  process.exit(0);
}

historico.snapshots.push({
  fecha: ultimo.fecha,
  cuentas: ultimo.cuentas.map((c) => ({ banco: c.banco, producto: c.producto, tae: c.tae, vinculacion: c.vinculacion })),
  depositos: ultimo.depositos.map((d) => ({ banco: d.banco, producto: d.producto, plazoMeses: d.plazoMeses, tae: d.tae })),
});
historico.snapshots.sort((a, b) => a.fecha.localeCompare(b.fecha));

writeFileSync(historicoRuta, JSON.stringify(historico, null, 1) + '\n');
console.log(`Instantánea del ${ultimo.fecha} añadida (${historico.snapshots.length} en total).`);
