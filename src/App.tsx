import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { AppProvider } from './context/AppContext';
import { AccountPage } from './pages/AccountPage';
import { ExplorePage } from './pages/ExplorePage';
import { ListItemPage } from './pages/ListItemPage';

export const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <NavBar />
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/list-item" element={<ListItemPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};
