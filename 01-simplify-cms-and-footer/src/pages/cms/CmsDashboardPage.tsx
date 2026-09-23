import { CmsSidebar } from '../../components/CmsSidebar';
import { SiteHeader } from '../../components/SiteHeader';
import { useCms } from '../../context/CmsContext';

export default function CmsDashboardPage(){
  const {leadership}=useCms();
  return <div className="admin">
    <CmsSidebar/>
    <main className="admin-main">
      <SiteHeader admin/>
      <p className="eyebrow">Overview</p>
      <h1>Content dashboard</h1>
      <p className="lead">Manage the public website content from one simple workspace.</p>
      <section className="admin-stats">
        <article><strong>5</strong><span>Website pages</span></article>
        <article><strong>{leadership.length}</strong><span>Leadership records</span></article>
        <article><strong>1</strong><span>Media Center</span></article>
        <article><strong>1</strong><span>Contact page</span></article>
      </section>
      <section className="cms-section">
        <p className="eyebrow">Quick explanation</p>
        <h2>Manage the content people see</h2>
        <p>Use Website content to edit page text and sections, Board &amp; leadership to manage people, Media Center to manage published items, Contact Us to manage contact details, and Brand &amp; global settings for the shared website identity.</p>
      </section>
    </main>
  </div>
}
