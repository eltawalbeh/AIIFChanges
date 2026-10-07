import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { useCms } from '../context/CmsContext';

const programs = [['/ceo-club', 'CEO Club', 'نادي الرؤساء التنفيذيين'], ['/membership', 'Membership', 'العضوية'], ['/leadership-council', 'Leadership Council', 'المجلس العالمي للقيادة'], ['/events', 'Events', 'الفعاليات']];

export function SiteFooter() {
  const { language, text } = useLocale();
  const { settings } = useCms();
  const brand = settings.brand || {};
  return <footer className="site-footer"><div className="footer-brand"><img src="/aiif-logo.png" alt="Arab International Investor Forum logo" /><p>{language === 'ar' ? (brand.tagline_ar || 'رأس المال. المعرفة. الفرصة.') : (brand.tagline_en || 'Capital. Knowledge. Opportunity.')}</p></div><div className="footer-programs"><p className="footer-label">{language === 'ar' ? 'استكشف AIIF' : 'Explore AIIF'}</p><nav>{programs.map(([to, en, ar]) => <Link to={to} key={to}>{language === 'ar' ? ar : en}</Link>)}<Link to="/contact-us">{text('Contact AIIF', 'تواصل مع المنتدى')}</Link></nav></div><a className="footer-credit" href="https://me.eltawalbeh.chatgpt.site/" target="_blank" rel="noreferrer">Designed &amp; developed by eltawalbeh™</a></footer>;
}
