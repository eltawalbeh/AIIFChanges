/** Figma Make-safe database setup. Apply this SQL once through Supabase migrations; do not upload a .sql file to Figma Make. */
export const aiifProgramsSetupSql = String.raw`
create extension if not exists pgcrypto;

create table if not exists public.aiif_ceo_club_settings (
  id boolean primary key default true check (id = true), name_en text not null, name_ar text not null,
  intro_en text not null default '', intro_ar text not null default '', status text not null default 'draft' check (status in ('draft','approved','published','archived')),
  updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);
create table if not exists public.membership_categories (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name_en text not null, name_ar text not null,
  description_en text not null default '', description_ar text not null default '', fee_label_en text not null default 'Fee to be confirmed', fee_label_ar text not null default 'الرسوم تحدد لاحقًا',
  display_order integer not null default 1, active boolean not null default true, status text not null default 'draft' check (status in ('draft','approved','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);
create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(), full_name text not null, email text not null, phone text, country text not null, organization text not null,
  job_title text, category_id uuid references public.membership_categories(id) on delete set null, background text, consent boolean not null default false check (consent = true),
  assigned_team text not null default 'Membership Team', status text not null default 'pending' check (status in ('pending','under_review','approved','rejected','archived')),
  internal_note text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.council_members (
  id uuid primary key default gen_random_uuid(), full_name_en text not null, full_name_ar text not null, title_en text not null default '', title_ar text not null default '',
  organization_en text not null default '', organization_ar text not null default '', bio_en text not null default '', bio_ar text not null default '', photo_path text,
  display_order integer not null default 1, active boolean not null default true, status text not null default 'draft' check (status in ('draft','approved','published','archived')),
  is_placeholder boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);
create table if not exists public.council_interest_submissions (
  id uuid primary key default gen_random_uuid(), full_name text not null, email text not null, country text, organization text not null, role text, expertise text not null,
  message text, consent boolean not null default false check (consent = true), assigned_team text not null default 'Council Team', status text not null default 'pending' check (status in ('pending','under_review','approved','rejected','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.aiif_events (
  id uuid primary key default gen_random_uuid(), slug text not null unique, title_en text not null, title_ar text not null, summary_en text not null default '', summary_ar text not null default '',
  description_en text not null default '', description_ar text not null default '', start_at timestamptz not null, end_at timestamptz, location_en text not null default '', location_ar text not null default '',
  visibility text not null default 'public' check (visibility in ('public','members_only','invited')), registration_open boolean not null default true, capacity integer, status text not null default 'draft' check (status in ('draft','approved','published','archived')),
  assigned_team text not null default 'Events Team', is_demo boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(), event_id uuid not null references public.aiif_events(id) on delete cascade, full_name text not null, email text not null, phone text,
  organization text, attendee_type text not null default 'public' check (attendee_type in ('public','member')), notes text, consent boolean not null default false check (consent = true), assigned_team text not null default 'Events Team',
  status text not null default 'pending' check (status in ('pending','confirmed','waitlisted','cancelled')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create or replace function public.aiif_program_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role in ('super_admin','content_admin')); $$;
revoke all on function public.aiif_program_admin() from public; grant execute on function public.aiif_program_admin() to authenticated;

alter table public.aiif_ceo_club_settings enable row level security; alter table public.membership_categories enable row level security; alter table public.membership_applications enable row level security; alter table public.council_members enable row level security; alter table public.council_interest_submissions enable row level security; alter table public.aiif_events enable row level security; alter table public.event_registrations enable row level security;
do $$ declare t text; begin foreach t in array array['aiif_ceo_club_settings','membership_categories','membership_applications','council_members','council_interest_submissions','aiif_events','event_registrations'] loop execute format('drop policy if exists %I on public.%I',t||'_public_read',t); execute format('drop policy if exists %I on public.%I',t||'_public_insert',t); execute format('drop policy if exists %I on public.%I',t||'_admin_all',t); end loop; end $$;
create policy aiif_ceo_club_settings_public_read on public.aiif_ceo_club_settings for select using (status='published'); create policy aiif_ceo_club_settings_admin_all on public.aiif_ceo_club_settings for all to authenticated using (public.aiif_program_admin()) with check (public.aiif_program_admin());
create policy membership_categories_public_read on public.membership_categories for select using (active and status='published'); create policy membership_categories_admin_all on public.membership_categories for all to authenticated using (public.aiif_program_admin()) with check (public.aiif_program_admin());
create policy membership_applications_public_insert on public.membership_applications for insert to anon,authenticated with check (consent=true); create policy membership_applications_admin_all on public.membership_applications for all to authenticated using (public.aiif_program_admin()) with check (public.aiif_program_admin());
create policy council_members_public_read on public.council_members for select using (active and status='published'); create policy council_members_admin_all on public.council_members for all to authenticated using (public.aiif_program_admin()) with check (public.aiif_program_admin());
create policy council_interest_submissions_public_insert on public.council_interest_submissions for insert to anon,authenticated with check (consent=true); create policy council_interest_submissions_admin_all on public.council_interest_submissions for all to authenticated using (public.aiif_program_admin()) with check (public.aiif_program_admin());
create policy aiif_events_public_read on public.aiif_events for select using (status='published' and registration_open=true); create policy aiif_events_admin_all on public.aiif_events for all to authenticated using (public.aiif_program_admin()) with check (public.aiif_program_admin());
create policy event_registrations_public_insert on public.event_registrations for insert to anon,authenticated with check (consent=true); create policy event_registrations_admin_all on public.event_registrations for all to authenticated using (public.aiif_program_admin()) with check (public.aiif_program_admin());

insert into public.aiif_ceo_club_settings(id,name_en,name_ar,intro_en,intro_ar,status) values(true,'AIIF CEO Club','نادي الرؤساء التنفيذيين في المنتدى','A private circle for leaders shaping investment and opportunity across the Arab region.','دائرة للقيادات التي تصنع الاستثمار والفرص في المنطقة العربية.','published') on conflict (id) do nothing;
insert into public.membership_categories(slug,name_en,name_ar,description_en,description_ar,display_order,status) values
('founding','Founding Circle','الدائرة التأسيسية','For early supporters and strategic patrons of AIIF.','للداعمين الأوائل والشركاء الاستراتيجيين للمنتدى.',1,'published'),
('investor','Investor & Business Leader','المستثمر وقائد الأعمال','For investors, founders and senior business leaders.','للمستثمرين والمؤسسين وكبار قادة الأعمال.',2,'published'),
('institutional','Institutional Partner','الشريك المؤسسي','For institutions, funds and ecosystem partners.','للمؤسسات والصناديق وشركاء المنظومة.',3,'published'),
('expert','Expert & Contributor','الخبير والمساهم','For specialists contributing knowledge and regional insight.','للخبراء الذين يساهمون بالمعرفة والرؤية الإقليمية.',4,'published') on conflict (slug) do nothing;
insert into public.council_members(full_name_en,full_name_ar,title_en,title_ar,organization_en,organization_ar,bio_en,bio_ar,display_order,status,is_placeholder,active) values
('Dr. Lina Haddad','د. لينا حداد','Council Member','عضو المجلس','AIIF','المنتدى','Sample profile — replace before publishing.','ملف تجريبي — يُستبدل قبل النشر.',1,'draft',true,false),
('Omar Al-Khatib','عمر الخطيب','Council Member','عضو المجلس','AIIF','المنتدى','Sample profile — replace before publishing.','ملف تجريبي — يُستبدل قبل النشر.',2,'draft',true,false),
('Mariam Chen','مريم تشن','Council Member','عضو المجلس','AIIF','المنتدى','Sample profile — replace before publishing.','ملف تجريبي — يُستبدل قبل النشر.',3,'draft',true,false);
insert into public.aiif_events(slug,title_en,title_ar,summary_en,summary_ar,start_at,location_en,location_ar,visibility,status,is_demo) values
('aiif-investment-dialogue','AIIF Investment Dialogue','حوار المنتدى حول الاستثمار','A sample public briefing for the AIIF community.','إحاطة عامة تجريبية لمجتمع المنتدى.',now()+interval '30 days','Jeddah','جدة','public','published',true),
('ceo-club-roundtable','CEO Club Roundtable','مائدة نادي الرؤساء التنفيذيين','A sample members-only roundtable.','مائدة مستديرة تجريبية للأعضاء.',now()+interval '45 days','Riyadh','الرياض','members_only','published',true),
('regional-capital-forum','Regional Capital Forum','منتدى رأس المال الإقليمي','A sample public forum for investors and institutions.','منتدى إقليمي تجريبي للمستثمرين والمؤسسات.',now()+interval '75 days','Dubai','دبي','public','published',true) on conflict (slug) do nothing;
create index if not exists membership_applications_status_idx on public.membership_applications(status,created_at desc); create index if not exists event_registrations_event_idx on public.event_registrations(event_id,created_at desc); create index if not exists aiif_events_start_idx on public.aiif_events(start_at);
create table if not exists public.aiif_program_sections (
  id uuid primary key default gen_random_uuid(), program text not null check (program in ('ceo-club','membership','leadership-council','events')),
  section_key text not null, title_en text not null default '', title_ar text not null default '', body_en text not null default '', body_ar text not null default '', cta_label_en text, cta_label_ar text, cta_url text,
  display_order integer not null default 1, active boolean not null default true, status text not null default 'draft' check (status in ('draft','approved','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), unique(program,section_key)
);
alter table public.aiif_program_sections enable row level security;
drop policy if exists aiif_program_sections_public_read on public.aiif_program_sections;
drop policy if exists aiif_program_sections_admin_all on public.aiif_program_sections;
create policy aiif_program_sections_public_read on public.aiif_program_sections for select using (active and status='published');
create policy aiif_program_sections_admin_all on public.aiif_program_sections for all to authenticated using (public.aiif_program_admin()) with check (public.aiif_program_admin());
insert into public.aiif_program_sections(program,section_key,title_en,title_ar,body_en,body_ar,cta_label_en,cta_label_ar,cta_url,display_order,status) values
('ceo-club','who-we-are','Who We Are','من نحن','AIIF CEO Club is a private business league headquartered in Delaware, bringing together senior leaders and investors to build meaningful economic bridges between the Arab world and the Global South, with an initial focus on China.','نادي AIIF CEO Club هو رابطة أعمال خاصة مقرها ولاية ديلاوير، تجمع كبار القادة والمستثمرين لبناء جسور اقتصادية مؤثرة بين العالم العربي ودول الجنوب العالمي، مع تركيز أولي على الصين.','','','',1,'published'),
('ceo-club','flagship-conference','Songjiang Conference 2027','مؤتمر سونغجيانغ 2027','Our inaugural flagship conference will take place in Songjiang, Shanghai, in April 2027. It is a curated matchmaking platform focused on investment, technology, energy, infrastructure and finance.','يقام مؤتمرنا الرئيسي الأول في سونغجيانغ، شنغهاي، في أبريل 2027. وهو منصة تواصل ومطابقة مختارة تركز على الاستثمار والتكنولوجيا والطاقة والبنية التحتية والتمويل.','Register Your Interest','سجّل اهتمامك','/events',2,'published'),
('membership','philosophy','Quality Over Quantity. Always.','الجودة قبل الكمية دائمًا.','Membership is limited and selective. Candidates are assessed for achievements, integrity, alignment with our mission and willingness to contribute to the community.','العضوية محدودة وانتقائية. يتم تقييم المرشحين وفق إنجازاتهم ونزاهتهم وانسجامهم مع رسالتنا واستعدادهم للمساهمة في المجتمع.','','','',1,'published'),
('membership','process','How to Join','كيف تنضم؟','Submit your application, complete verification, pass Board review, receive approval and complete onboarding. The process may take 2–4 weeks.','قدّم طلبك، وأكمل التحقق، واجتز مراجعة المجلس، واحصل على الموافقة، ثم أكمل إجراءات الانضمام. قد تستغرق العملية من أسبوعين إلى أربعة أسابيع.','Apply for Membership','تقدّم للعضوية','#membership-application',2,'published'),
('leadership-council','purpose','Guiding the Club. Shaping the Future.','توجيه النادي وصناعة المستقبل.','The Global Leadership Council provides strategic counsel, supports institutional development, strengthens reputation and ethics, and serves as an ambassador for the Club.','يقدم المجلس العالمي للقيادة المشورة الاستراتيجية، ويدعم التطوير المؤسسي، ويعزز السمعة والأخلاقيات، ويعمل سفيرًا للنادي.','','','',1,'published'),
('leadership-council','nomination','How to Join','كيف تنضم؟','Council membership is by nomination or invitation. Candidates are reviewed and approved by the Board before receiving a formal invitation.','تتم عضوية المجلس بالترشيح أو الدعوة. تتم مراجعة المرشحين واعتمادهم من قبل مجلس الإدارة قبل توجيه الدعوة الرسمية.','Submit Expression of Interest','أرسل إبداء الاهتمام','#council-interest',2,'published'),
('events','overview','Where Relationships Are Built','حيث تُبنى العلاقات.','AIIF CEO Club events are curated environments where trust is built, partnerships are formed and opportunities are explored.','فعاليات نادي AIIF CEO Club هي بيئات مختارة تُبنى فيها الثقة، وتتشكّل الشراكات، وتُستكشف الفرص.','','','',1,'published'),
('events','registration','How to Register','كيف تسجل؟','Select an event, complete the registration form and receive confirmation. Capacity may be limited and details are subject to change.','اختر الفعالية، وأكمل نموذج التسجيل، واحصل على التأكيد. قد تكون السعة محدودة، وتخضع التفاصيل للتغيير.','Register Your Interest','سجّل اهتمامك','#events',2,'published')
on conflict (program,section_key) do nothing;
`;


