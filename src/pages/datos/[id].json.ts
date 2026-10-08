import type { APIRoute, GetStaticPaths } from 'astro';
import { DATASETS, DATASET_POR_ID, aJson } from '../../lib/datasets';

export const getStaticPaths: GetStaticPaths = () => DATASETS.map((d) => ({ params: { id: d.id } }));

export const GET: APIRoute = ({ params }) => {
  const d = DATASET_POR_ID.get(params.id as string)!;
  return new Response(JSON.stringify(aJson(d), null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
