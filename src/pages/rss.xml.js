import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { isPublished } from '../lib/posts';
import { SITE } from '../config/site';

export async function GET(context) {
  const [posts, mercados, newsletter] = await Promise.all([
    getCollection('blog', ({ data }) => isPublished(data)),
    getCollection('mercados', ({ data }) => isPublished(data)),
    getCollection('newsletter', ({ data }) => isPublished(data)),
  ]);

  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    ...mercados.map((dia) => ({
      title: dia.data.title,
      description: dia.data.description,
      pubDate: dia.data.pubDate,
      link: `/mercados/${dia.id}/`,
      categories: ['mercados'],
    })),
    ...newsletter.map((numero) => ({
      title: numero.data.title,
      description: numero.data.description,
      pubDate: numero.data.pubDate,
      link: `/newsletter/${numero.id}/`,
      categories: ['newsletter'],
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    customData: '<language>es-es</language>',
    items,
  });
}
