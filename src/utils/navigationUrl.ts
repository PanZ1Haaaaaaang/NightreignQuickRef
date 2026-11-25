import { getDefaultPage, getPageByKey, NAV_PAGES, type NavPage, type NavSection } from '../config/navigationConfig';

export interface NavigationTarget {
  page: NavPage;
  section?: NavSection;
}

export function readNavigationTarget(search: string): NavigationTarget {
  const params = new URLSearchParams(search);
  const page = NAV_PAGES.find(({ slug }) => slug === params.get('page'));
  if (!page) {
    return { page: getPageByKey(getDefaultPage()) ?? NAV_PAGES[0] };
  }

  return { page, section: page.sections.find(({ anchorId }) => anchorId === params.get('section')) };
}

export function navigationUrl(href: string, { page, section }: NavigationTarget): URL {
  const url = new URL(href);
  url.searchParams.set('page', page.slug);
  if (section) {
    url.searchParams.set('section', section.anchorId);
  } else {
    url.searchParams.delete('section');
  }
  return url;
}
