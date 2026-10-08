import type { APIRoute, GetStaticPaths } from 'astro';
import { DATASETS, DATASET_POR_ID, aCsv } from '../../lib/datasets';

export const getStaticPaths: GetStaticPaths = () => DATASETS.map((d) => ({ params: { id: d.id } }));

export const GET: APIRoute = ({ params }) => {
  const d = DATASET_POR_ID.get(params.id as string)!;
  return new Response(aCsv(d), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
