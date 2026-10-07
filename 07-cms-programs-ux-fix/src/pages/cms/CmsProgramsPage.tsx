import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CmsSidebar } from '../../components/CmsSidebar';
import { SiteHeader } from '../../components/SiteHeader';
import { supabase } from '../../lib/supabase';

type Tab = 'club' | 'membership' | 'council' | 'events' | 'inbox';
const labels: Record<Tab, string> = { club: 'CEO Club settings', membership: 'Membership categories', council: 'Global Leadership Council', events: 'Events', inbox: 'Applications & registrations' };
const tabFromUrl = (): Tab => { const value = new URLSearchParams(window.location.search).get('tab'); return ['club', 'membership', 'council', 'events', 'inbox'].includes(value || '') ? value as Tab : 'club'; };
const emptyForm = { status: 'draft', active: true, registration_open: true, visibility: 'public', display_order: '1' } as Record<string, string | boolean>;

export default function CmsProgramsPage() {
  const [tab, setTab] = useState<Tab>(tabFromUrl);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string | boolean>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const table = tab === 'club' ? 'aiif_ceo_club_settings' : tab === 'membership' ? 'membership_categories' : tab === 'council' ? 'council_members' : tab === 'events' ? 'aiif_events' : 'membership_applications';
  const fields = useMemo<Array<[string, string, boolean]>>(() => {
    if (tab === 'club') return [['name_en', 'English name', false], ['name_ar', 'الاسم بالعربية', true], ['intro_en', 'Introduction — English', false], ['intro_ar', 'المقدمة — العربية', true]];
    if (tab === 'membership') return [['slug', 'Slug', false], ['name_en', 'English name', false], ['name_ar', 'الاسم بالعربية', true], ['description_en', 'Description — English', false], ['description_ar', 'الوصف — العربية', true], ['fee_label_en', 'Fee label — English', false], ['fee_label_ar', 'الرسوم — العربية', true]];
    if (tab === 'council') return [['full_name_en', 'Name — English', false], ['full_name_ar', 'الاسم — العربية', true], ['title_en', 'Title — English', false], ['title_ar', 'المنصب — العربية', true], ['organization_en', 'Organization — English', false], ['organization_ar', 'المؤسسة — العربية', true], ['bio_en', 'Bio — English', false], ['bio_ar', 'السيرة — العربية', true]];
    if (tab === 'events') return [['slug', 'Slug', false], ['title_en', 'Title — English', false], ['title_ar', 'العنوان — العربية', true], ['summary_en', 'Summary — English', false], ['summary_ar', 'الملخص — العربية', true], ['start_at', 'Start date/time', false], ['location_en', 'Location — English', false], ['location_ar', 'الموقع — العربية', true]];
    return [];
  }, [tab]);

  useEffect(() => { const onPop = () => { setTab(tabFromUrl()); setEditingId(null); }; window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop); }, []);
  const set = (key: string, value: string | boolean) => setForm(value === '' ? { ...form, [key]: value } : { ...form, [key]: value });
  const selectTab = (next: Tab) => { setTab(next); setEditingId(null); window.history.pushState(null, '', `/cms/programs?tab=${next}`); window.dispatchEvent(new PopStateEvent('popstate')); };

  const load = async () => {
    setLoading(true); setMessage('');
    if (tab === 'inbox') {
      const [a, b, c] = await Promise.all([supabase.from('membership_applications').select('*').order('created_at', { ascending: false }), supabase.from('council_interest_submissions').select('*').order('created_at', { ascending: false }), supabase.from('event_registrations').select('*').order('created_at', { ascending: false })]);
      setRows([...(a.data || []).map(x => ({ ...x, source_table: 'membership_applications', source_label: 'Membership' })), ...(b.data || []).map(x => ({ ...x, source_table: 'council_interest_submissions', source_label: 'Council' })), ...(c.data || []).map(x => ({ ...x, source_table: 'event_registrations', source_label: 'Event' }))]);
      if (a.error || b.error || c.error) setMessage((a.error || b.error || c.error)?.message || 'Could not load inbox');
    } else {
      const order = tab === 'club' ? 'updated_at' : 'created_at';
      const { data, error } = await supabase.from(table).select('*').order(order, { ascending: false });
      setRows(data || []);
      if (error) setMessage(error.message); else if (tab === 'club' && data?.[0]) setForm({ ...emptyForm, ...data[0] });
    }
    setLoading(false);
  };
  useEffect(() => { void load(); }, [tab, table]);

  const save = async (event: FormEvent) => {
    event.preventDefault(); setMessage('Saving…');
    const payload: Record<string, unknown> = tab === 'club' ? { id: true, name_en: String(form.name_en || ''), name_ar: String(form.name_ar || ''), intro_en: String(form.intro_en || ''), intro_ar: String(form.intro_ar || ''), status: String(form.status || 'draft') } : { ...form, display_order: Number(form.display_order || 1), active: Boolean(form.active), registration_open: Boolean(form.registration_open) };
    const result = tab === 'club' ? await supabase.from(table).upsert(payload as any, { onConflict: 'id' }).select().single() : editingId ? await supabase.from(table).update(payload as any).eq('id', editingId).select().single() : await supabase.from(table).insert(payload as any).select().single();
    if (result.error) setMessage(`Could not save: ${result.error.message}`); else { setMessage('Saved successfully.'); setEditingId(null); await load(); }
  };
  const updateStatus = async (row: any, status: string) => { const target = row.source_table || table; const { error } = await supabase.from(target).update({ status }).eq('id', row.id); setMessage(error ? error.message : 'Status updated.'); void load(); };

  return <div className="admin"><CmsSidebar /><main className="admin-main"><SiteHeader admin /><p className="eyebrow">CMS / AIIF programs</p><h1>Programs</h1><p className="lead">Use the left menu to manage one program area at a time. All English and Arabic fields are paired and aligned.</p><section className="cms-section"><h2>{labels[tab]}</h2>{tab !== 'inbox' && <form className="content-form program-admin-form" onSubmit={save}><h3>{tab === 'club' ? 'Club settings' : editingId ? 'Edit record' : `Add ${labels[tab].toLowerCase()}`}</h3>{fields.map(([key, label, arabic]) => <label key={key} lang={arabic ? 'ar' : 'en'} dir={arabic ? 'rtl' : 'ltr'}>{label}{['intro', 'description', 'bio', 'summary'].some(part => key.includes(part)) ? <textarea value={String(form[key] || '')} onChange={e => set(key, e.target.value)} /> : <input required={['name_en', 'name_ar', 'title_en', 'title_ar', 'full_name_en', 'full_name_ar', 'slug', 'start_at'].includes(key)} type={key === 'start_at' ? 'datetime-local' : 'text'} value={String(form[key] || '')} onChange={e => set(key, e.target.value)} />}</label>)}{tab !== 'club' && <label>Display order<input type="number" value={String(form.display_order || '1')} onChange={e => set('display_order', e.target.value)} /></label>}{(tab === 'council' || tab === 'events' || tab === 'membership') && <label>Publishing status<select value={String(form.status || 'draft')} onChange={e => set('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></label>}{tab === 'events' && <><label>Visibility<select value={String(form.visibility || 'public')} onChange={e => set('visibility', e.target.value)}><option value="public">Public</option><option value="members_only">Members only</option><option value="invited">Invite only</option></select></label><label className="toggle-row"><input type="checkbox" checked={Boolean(form.registration_open)} onChange={e => set('registration_open', e.target.checked)} />Registration open</label></>}<button className="button" type="submit">Save {tab === 'club' ? 'settings' : 'record'}</button></form>}<p className="form-message" role="status">{message}</p><div className="cms-record-list">{loading ? <p>Loading…</p> : rows.map(row => <article key={`${row.source_table || table}-${row.id}`}><div><strong>{row.name_en || row.full_name_en || row.title_en || row.email}</strong><small>{row.source_label || row.status || row.visibility}</small></div>{tab !== 'inbox' && tab !== 'club' && <button type="button" className="plain-button" onClick={() => { setEditingId(row.id); setForm({ ...emptyForm, ...row, display_order: String(row.display_order || 1) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>}{row.status && <select value={row.status} onChange={e => void updateStatus(row, e.target.value)}><option value="pending">Pending</option><option value="under_review">Under review</option><option value="draft">Draft</option><option value="published">Published</option><option value="approved">Approved</option><option value="confirmed">Confirmed</option><option value="rejected">Rejected</option><option value="archived">Archived</option></select>}</article>)}</div></section></main></div>;
}
