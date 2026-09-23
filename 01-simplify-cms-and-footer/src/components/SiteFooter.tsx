import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { useCms } from '../context/CmsContext';

export function SiteFooter(){
  const {language,text}=useLocale();
  const {settings}=useCms();
  const brand=settings.brand||{};
  return <footer>
    <img src="/aiif-logo.png" alt="Arab International Investor Forum logo"/>
    <p>{language==='ar'?(brand.tagline_ar||'رأس المال. المعرفة. الفرصة.'):(brand.tagline_en||'Capital. Knowledge. Opportunity.')}</p>
    <Link to="/contact-us">{text('Contact AIIF','تواصل مع المنتدى')}</Link>
    <a href="https://me.eltawalbeh.chatgpt.site/" target="_blank" rel="noreferrer">Designed &amp; developed by eltawalbeh™</a>
  </footer>
}
