import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { FooterStaticPage } from '@/components/layout/FooterStaticPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('staticPages');

  return {
    title: `${t('contactsTitle')} | Ticketok`,
  };
}

export default function ContactsPage() {
  return <FooterStaticPage pageKey="contacts" />;
}
