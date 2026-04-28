import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardPage from './pages/DashboardPage';
import DebriefPage from './pages/DebriefPage';
import NotFoundPage from './pages/NotFoundPage';
import styles from './styles/App.module.css';

function App() {
  // Auto-set JWT token for development
  useEffect(() => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNDEyZjIzNi00ZWRjLTQ3YTItOGY1NC04NzYzYTZlZDJjZTgiLCJpYXQiOjE3NzcyODgwOTQsImV4cCI6MTc3NzM3NDQ5NCwicm9sZSI6InRyYWRlciIsIm5hbWUiOiJBbGV4IE1lcmNlciJ9.jaocuOfDvZXcpNHI9_jnFQ4ezJCuxlAk9TsWD0YiOEk';
    if (!localStorage.getItem('jwt')) {
      localStorage.setItem('jwt', token);
      console.log('JWT token set automatically for development');
    }
  }, []);

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div>
          <p className={styles.brand}>Trading Behavior</p>
          <p className={styles.subtitle}>Real-time coaching for every session.</p>
        </div>
        <nav className={styles.nav} aria-label="Primary navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Dashboard
          </NavLink>
          <NavLink to="/debrief/b2c3d4e5-f6a7-8901-bcde-f12345678901" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Debrief Flow
          </NavLink>
        </nav>
      </header>

      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/debrief/:sessionId" element={<DebriefPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className={styles.footer}>
        <Link to="/" className={styles.footerLink}>
          Back to dashboard
        </Link>
        <span>© 2026 Trading Behavior Platform</span>
      </footer>
      </div>
  );
}

export default App;
