import { supabase } from './supabase';

export async function getPublicCeoClub(){const {data,error}=await supabase.from('aiif_ceo_club_settings').select('*').eq('id',true).eq('status','published').maybeSingle();return error?null:data;}
export async function getPublicMembershipCategories(){const {data,error}=await supabase.from('membership_categories').select('*').eq('active',true).eq('status','published').order('display_order');return error?[]:data||[];}
export async function getPublicCouncilMembers(){const {data,error}=await supabase.from('council_members').select('*').eq('active',true).eq('status','published').order('display_order');return error?[]:data||[];}
export async function getPublicEvents(){const {data,error}=await supabase.from('aiif_events').select('*').eq('registration_open',true).eq('status','published').order('start_at');if(error)return [];const {data:{user}}=await supabase.auth.getUser();return (data||[]).filter((event:any)=>event.visibility!=='members_only'||Boolean(user));}
export async function submitMembershipApplication(values:Record<string,unknown>){return supabase.from('membership_applications').insert({...values,assigned_team:'Membership Team',status:'pending'});}
export async function submitCouncilInterest(values:Record<string,unknown>){return supabase.from('council_interest_submissions').insert({...values,assigned_team:'Council Team',status:'pending'});}
export async function submitEventRegistration(values:Record<string,unknown>){return supabase.from('event_registrations').insert({...values,assigned_team:'Events Team',status:'pending'});}

