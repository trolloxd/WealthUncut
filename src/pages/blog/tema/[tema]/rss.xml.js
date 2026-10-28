import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { isPublished } from '../../../../lib/posts';
import { SITE } from '../../../../config/site';
import { CATEGORIAS, categoriaDe } from '../../../../config/categorias';

// Un feed RSS por tema del blog (/blog/tema/<id>/rss.xml): quien solo quiere, por ejemplo, vivienda o impuestos.
export async function getStaticPaths() {
  const posts = (await getCollection('blog', ({ data }) => isPublished(data))).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  return CATEGORIAS.map((c) => ({ c, posts: posts.filter((p) => categoriaDe(p.data).id === c.id) }))
    .filter((x) => x.posts.length > 0)
    .map(({ c, posts: ps }) => ({ params: { tema: c.id }, props: { c, posts: ps } }));
}

export function GET(context) {
  const { c, posts } = context.props;
  return rss({
    title: `${SITE.name}: ${c.nombre}`,
    description: c.descripcion,
    site: context.site,
    customData: '<language>es-es</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
  });
}
