import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navigation.css';

export default function Navigation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
        { path: '/tasks', label: '📝 Tasks', icon: '📝' },
        { path: '/analytics', label: '📈 Analytics', icon: '📈' },
    ];

    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-brand">
                    <h2>Personal Tracker</h2>
                </div>

                <div className="nav-links">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label.replace(/^.+ /, '')}</span>
                        </Link>
                    ))}
                </div>

                <button onClick={handleLogout} className="logout-button">
                    🚪 Logout
                </button>
            </div>
        </nav>
    );
}
