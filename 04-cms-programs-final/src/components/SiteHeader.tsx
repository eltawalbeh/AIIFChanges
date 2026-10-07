import { Link, NavLink } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { useCms } from '../context/CmsContext';

const core = [['/', 'Home', 'الرئيسية'], ['/about-us', 'About Us', 'من نحن'], ['/board', 'Board', 'مجلس الإدارة'], ['/media-center', 'Media Center', 'المركز الإعلامي'], ['/contact-us', 'Contact Us', 'اتصل بنا']];
const programs = [['/ceo-club', 'CEO Club', 'نادي الرؤساء التنفيذيين'], ['/membership', 'Membership', 'العضوية'], ['/leadership-council', 'Leadership Council', 'المجلس العالمي للقيادة'], ['/events', 'Events', 'الفعاليات']];

export function SiteHeader({ admin = false }: { admin?: boolean }) {
  const { language, toggle } = useLocale();
  const { settings } = useCms();
  const brand = settings.brand || {};
  const configured = Array.isArray(settings.navigation?.items) ? settings.navigation.items.map((item: any) => [item.path, item.label_en, item.label_ar]) : [];
  const nav = configured.length ? [...configured, ...programs.filter(([path]) => !configured.some(([p]: string[]) => p === path))] : [...core, ...programs];
  const brandName = language === 'ar' ? (brand.name_ar || 'المنتدى العربي الدولي للمستثمرين') : (brand.name_en || 'Arab International Investor Forum');
  return <><a className="skip-link" href="#main-content">{language === 'ar' ? 'انتقل إلى المحتوى الرئيسي' : 'Skip to main content'}</a><header className="site-header"><Link className="wordmark" to={`/${admin ? 'cms' : ''}`}>AIIF<span> / </span>{admin ? 'PRIVATE' : brandName}</Link><nav>{admin ? <><Link to="/">Website</Link><Link to="/cms">Dashboard</Link></> : <>{nav.map(([to, en, ar]: any) => <NavLink to={to} end={to === '/'} key={to}>{language === 'ar' ? ar : en}</NavLink>)}<button className="language-switch" type="button" onClick={toggle} aria-label="Change language">{language === 'en' ? 'العربية' : 'English'}</button></>}</nav></header></>;
}
