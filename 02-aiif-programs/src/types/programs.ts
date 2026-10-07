export type ProgramKind = 'ceo-club' | 'membership' | 'leadership-council' | 'events';
export type ProgramStatus = 'draft' | 'approved' | 'published' | 'archived';

export type MembershipCategory = { id:string; slug:string; name_en:string; name_ar:string; description_en:string; description_ar:string; fee_label_en:string; fee_label_ar:string; display_order:number; active:boolean; status:ProgramStatus };
export type CouncilMember = { id:string; full_name_en:string; full_name_ar:string; title_en:string; title_ar:string; organization_en:string; organization_ar:string; bio_en:string; bio_ar:string; photo_path?:string|null; display_order:number; active:boolean; status:ProgramStatus; is_placeholder:boolean };
export type AiifEvent = { id:string; slug:string; title_en:string; title_ar:string; summary_en:string; summary_ar:string; description_en:string; description_ar:string; start_at:string; end_at?:string|null; location_en:string; location_ar:string; visibility:'public'|'members_only'|'invited'; registration_open:boolean; status:ProgramStatus; capacity?:number|null; is_demo:boolean };

