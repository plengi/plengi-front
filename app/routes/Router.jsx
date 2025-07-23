import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Importa tus otras páginas aquí
// import Home from '../pages/Dashboard/Home';
// import Profile from '../pages/Dashboard/Profile';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/dashboard',
        element: (
        <ProtectedRoute>
            <DashboardLayout />
        </ProtectedRoute>
        ),
        children: [
        {
            path: '',
            element: <Navigate to="home" replace />,
        },
        // {
        //   path: 'home',
        //   element: <Home />,
        // },
        // {
        //   path: 'profile',
        //   element: <Profile />,
        // },
        // Agrega aquí las rutas de tus otras ventanas
        ],
    },
]);

export default router;