import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { useCms } from '../context/CmsContext';

const core = [['/', 'Home', 'الرئيسية'], ['/about-us', 'About Us', 'من نحن'], ['/board', 'Board', 'مجلس الإدارة'], ['/media-center', 'Media Center', 'المركز الإعلامي'], ['/contact-us', 'Contact Us', 'اتصل بنا'], ['/events', 'Events', 'الفعاليات']];
const programs = [['/ceo-club', 'CEO Club', 'نادي الرؤساء التنفيذيين', 'Private leadership circle'], ['/membership', 'Membership', 'العضوية', 'Membership pathways and applications'], ['/leadership-council', 'Leadership Council', 'المجلس العالمي للقيادة', 'Council members and expressions of interest']];

export function SiteHeader({ admin = false }: { admin?: boolean }) {
  const { language, toggle } = useLocale(); const { settings } = useCms(); const [open, setOpen] = useState(false); const brand = settings.brand || {};
  const configured = Array.isArray(settings.navigation?.items) ? settings.navigation.items.map((item: any) => [item.path, item.label_en, item.label_ar]) : [];
  const nav = configured.length ? [...configured.filter(([path]: string[]) => !programs.some(([programPath]) => programPath === path) && path !== '/events'), ['/events', 'Events', 'الفعاليات']] : core;
  const brandName = language === 'ar' ? (brand.name_ar || 'المنتدى العربي الدولي للمستثمرين') : (brand.name_en || 'Arab International Investor Forum');
  return <><a className="skip-link" href="#main-content">{language === 'ar' ? 'انتقل إلى المحتوى الرئيسي' : 'Skip to main content'}</a><header className="site-header"><Link className="wordmark" to={admin ? '/cms' : '/'}>AIIF<span> / </span>{admin ? 'PRIVATE' : brandName}</Link><nav>{admin ? <><Link to="/">Website</Link><Link to="/cms">Dashboard</Link></> : <>{nav.map(([to, en, ar]: any) => <NavLink to={to} end={to === '/'} key={to}>{language === 'ar' ? ar : en}</NavLink>)}<div className="program-nav" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}><button type="button" className="program-nav-trigger" aria-expanded={open} onClick={() => setOpen(value => !value)}>{language === 'ar' ? 'برامج AIIF' : 'AIIF Programs'}<span aria-hidden="true">⌄</span></button>{open && <div className="program-menu">{programs.map(([to, en, ar, desc]) => <Link to={to} key={to} onClick={() => setOpen(false)}><strong>{language === 'ar' ? ar : en}</strong><small>{language === 'ar' ? 'استكشف هذا القسم' : desc}</small><span aria-hidden="true">↗</span></Link>)}</div>}</div><button className="language-switch" type="button" onClick={toggle} aria-label="Change language">{language === 'en' ? 'العربية' : 'English'}</button></>}</nav></header></>;
}
