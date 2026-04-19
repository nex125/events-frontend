import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getPublicSiteInfo } from '@/lib/api';
import { buildContentFetchInit } from '@/lib/fetchPolicy';

const FETCH_TIMEOUT_MS = 8000;

function normalizeExternalUrl(value: string): string {
  if (!value) {
    return '#';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

export async function Footer() {
  const t = await getTranslations('footer');
  const siteInfo = await getPublicSiteInfo(
    buildContentFetchInit(AbortSignal.timeout(FETCH_TIMEOUT_MS)),
  ).catch(() => ({
    contactEmail: '',
    contactPhone: '',
    address: '',
    aboutText: '',
    socialLinks: {
      instagram: '',
      telegram: '',
      vk: '',
    },
  }));
  const footerLinks = [
    { href: '#', label: t('privacy') },
    { href: '#', label: t('terms') },
    { href: '#', label: t('contacts') },
    { href: '#', label: t('partners') },
  ];
  const socialLinks = [
    { href: siteInfo.socialLinks.instagram, label: t('instagram') },
    { href: siteInfo.socialLinks.telegram, label: t('telegram') },
    { href: siteInfo.socialLinks.vk, label: t('vk') },
  ].filter((link) => link.href.length > 0);

  return (
    <footer className="relative w-full border-t border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none opacity-[0.04] select-none">
        <span className="text-[clamp(4rem,20vw,15.625rem)] leading-none whitespace-nowrap font-display font-black tracking-tighter">
          TICKETOK
        </span>
      </div>

      <div className="ds-section-footer relative z-10">
        <div className="max-w-[80rem] mx-auto flex flex-col md:flex-row justify-between items-stretch gap-8">
          <div className="flex flex-col justify-between gap-4 items-center md:items-start">
            <Link
              href="/"
              className="ds-heading-md ds-gradient-primary-text tracking-tighter"
            >
              Ticketok
            </Link>
            <div className="text-[var(--ds-on-surface-variant)] ds-body-sm max-w-xl text-center md:text-left space-y-1">
              {siteInfo.aboutText && <p>{siteInfo.aboutText}</p>}
              {siteInfo.address && (
                <p>
                  {t('address')}: {siteInfo.address}
                </p>
              )}
              {siteInfo.contactPhone && (
                <p>
                  {t('phone')}{' '}
                  <a
                    href={`tel:${siteInfo.contactPhone}`}
                    className="text-[var(--ds-primary)] underline decoration-[var(--ds-primary-border)] underline-offset-2 hover:decoration-[var(--ds-primary)] transition-colors"
                  >
                    {siteInfo.contactPhone}
                  </a>
                </p>
              )}
              {siteInfo.contactEmail && (
                <p>
                  {t('email')}{' '}
                  <a
                    href={`mailto:${siteInfo.contactEmail}`}
                    className="text-[var(--ds-primary)] underline decoration-[var(--ds-primary-border)] underline-offset-2 hover:decoration-[var(--ds-primary)] transition-colors"
                  >
                    {siteInfo.contactEmail}
                  </a>
                </p>
              )}
              <p>
                &copy; {new Date().getFullYear()} ticketok. {t('copyright')}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between items-center md:items-end gap-6 shrink-0">
            <div className="flex flex-wrap justify-center gap-10">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="ds-label-sm text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-tertiary)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6">
                {socialLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={normalizeExternalUrl(link.href)}
                    target="_blank"
                    rel="noreferrer"
                    className="ds-label-sm text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-tertiary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            {/* Payment system logos */}
            <Image
              src="/bepaid_logos.svg"
              alt={t('paymentAlt')}
              width={220}
              height={32}
              className="h-8 w-auto opacity-60"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
