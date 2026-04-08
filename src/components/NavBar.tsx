import { NavLink } from 'react-router-dom';

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`;

export const NavBar = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavLink to="/" className="flex items-center gap-3 text-lg font-bold text-slate-900">
          <img src="/logo.svg" alt="LocalLender logo" className="h-12 w-12" />
          LocalLender
        </NavLink>

        <nav aria-label="Primary navigation" className="flex items-center gap-2">
          <NavLink to="/" className={getLinkClassName}>
            Explore
          </NavLink>
          <NavLink to="/list-item" className={getLinkClassName}>
            List item
          </NavLink>
          <NavLink to="/account" className={getLinkClassName}>
            Account
          </NavLink>
        </nav>
      </div>
    </header>
  );
};
