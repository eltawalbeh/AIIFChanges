import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const items=[['/cms','Overview'],['/cms/brand','Brand & global settings'],['/cms/pages','Website content'],['/cms/pages?page=about-us','About Us'],['/cms/leadership','Board & leadership'],['/cms/media','Media Center'],['/cms/contact','Contact Us']];

export function CmsSidebar(){
  const location=useLocation();
  const {profile,signOut}=useAuth();
  const visible=profile?.role==='super_admin'?[...items,['/cms/users','Users & roles']]:items;
  return <aside className="sidebar">
    <p className="eyebrow">AIIF / PRIVATE</p>
    <h2>Content dashboard</h2>
    <nav>{visible.map(([path,name])=>{
      const active=path.includes('?')?(location.pathname + location.search)===path:location.pathname===path;
      return <Link className={active?'active':''} to={path} key={name}>{name}</Link>
    })}</nav>
    <div className="sidebar-user">
      <small>{profile?.role==='super_admin'?'Super Admin':'Content Admin'}</small>
      <button className="plain-button" type="button" onClick={signOut}>Sign out</button>
    </div>
  </aside>
}
