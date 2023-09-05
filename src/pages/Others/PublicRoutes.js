import { Navigate, Outlet } from 'react-router-dom';

const auth = () => {
    const token = localStorage.getItem('accessToken') || '';
    if (!token) {
        return false;
    }
    return true;
};

const role = () => {
    const userRole = JSON.parse(localStorage.getItem('userRole')) || '';
    if (userRole === 'Member') {
        return true;
    }
    return false;
};

const PublicRoutes = () => {
    const isAuth = auth();
    const isMember = role();
    return isAuth ? <Navigate to={isMember ? '/documents/documents-in' : '/dashboard'} /> : <Outlet />;
};

export default PublicRoutes;
