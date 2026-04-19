import { getTranslations } from 'next-intl/server';
import { getPublicSiteInfo } from '@/lib/api';
import { buildContentFetchInit } from '@/lib/fetchPolicy';

const FETCH_TIMEOUT_MS = 8000;

interface FooterStaticPageProps {
  pageKey: 'privacy' | 'terms' | 'contacts' | 'partners';
}

export async function FooterStaticPage({ pageKey }: FooterStaticPageProps) {
  const t = await getTranslations('staticPages');
  const siteInfo = await getPublicSiteInfo(
    buildContentFetchInit(AbortSignal.timeout(FETCH_TIMEOUT_MS)),
  ).catch(() => ({
    footerPages: {
      privacy: '',
      terms: '',
      contacts: '',
      partners: '',
    },
  }));
  const content = siteInfo.footerPages[pageKey].trim();
  const titleKey = `${pageKey}Title` as const;

  return (
    <section className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-container-low)] p-8 md:p-12">
        <h1 className="ds-display-sm mb-6 text-[var(--ds-on-surface)]">{t(titleKey)}</h1>
        {content ? (
          <div className="ds-body-md whitespace-pre-wrap leading-8 text-[var(--ds-on-surface-variant)]">
            {content}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="ds-heading-sm text-[var(--ds-on-surface)]">{t('emptyTitle')}</p>
            <p className="ds-body-md text-[var(--ds-on-surface-variant)]">{t('emptyDescription')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
