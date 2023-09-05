import { useState, useEffect, createContext, useRef } from 'react';
import jwt_decode from 'jwt-decode';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Signin, ForgotPassword, ResetPassword } from './pages/Authentications';
import { Department, CreateDepartment } from './pages/Departments';
import { DocumentIn, DocumentOut, DocumentDetail, CreateDocument } from './pages/Documents';
import { Task, AdminTaskDetail, MemberTaskDetail, CreateTask } from './pages/Tasks';
import { User, CreateUser, RequestChange } from './pages/Users';
import { DocumentStatistics, SystemStatistics, TaskStatistics } from './pages/Statistics';
import { Dashboard, Profile, Page404, BlockPage, ProtectedRoutes, PublicRoutes } from './pages/Others';
import DefaultLayout from './layouts/DefaultLayout';
import * as authServices from '~/services/authServices';

export const UserInfoContext = createContext();

const App = () => {
    const [userRole, setUserRole] = useState(JSON.parse(localStorage.getItem('userRole')) || '');
    const [userId, setUserId] = useState(JSON.parse(localStorage.getItem('userId')) || '');
    const [activeFlag, setActiveFlag] = useState(JSON.parse(localStorage.getItem('activeFlag')) || true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isChangeUserInfo, setIsChangeUserInfo] = useState(false);

    // Init socket.io server
    const socket = useRef();
    useEffect(() => {
        socket.current = io('http://192.168.1.188:8080', { transports: ['websocket'] });
    }, []);

    // Send info to socket.io server
    useEffect(() => {
        socket.current?.emit('addUser', userId);
        // socket.current?.on('getUsers', (users) => {
        //     console.log(users);
        // });
    }, [userId]);

    // Get user temp role
    const getTempRole = () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;
        const decodedToken = jwt_decode(accessToken);
        return decodedToken.role;
    };

    // Check exp of refresh to logout
    useEffect(() => {
        const checkRefreshExp = async () => {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return;
            const decodedToken = jwt_decode(refreshToken);
            let currentDate = new Date();
            if (decodedToken.exp * 1000 < currentDate.getTime()) {
                await authServices.signOut({ token: refreshToken });
                localStorage.clear();
            }
        };
        checkRefreshExp();
    }, []);

    // Get userRole and userId from accessToken after sign in
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;
        const decodedToken = jwt_decode(accessToken);
        setUserRole(decodedToken.role);
        setUserId(decodedToken._id);
    }, [isLoggedIn]);

    // Get isActived user from accessToken after sign in
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) return;
        const fetchApi = async () => {
            const res = await authServices.getCurrUser();
            setActiveFlag(res.isActived);
        };
        fetchApi();
    }, [isLoggedIn]);

    // Save userRole in localstorage after sign in
    useEffect(() => {
        localStorage.setItem('userRole', JSON.stringify(userRole));
    }, [userRole, isLoggedIn]);

    // Save userId in localstorage after sign in
    useEffect(() => {
        localStorage.setItem('userId', JSON.stringify(userId));
    }, [userId, isLoggedIn]);

    // Save isActived user in localstorage after sign in
    useEffect(() => {
        localStorage.setItem('activeFlag', JSON.stringify(activeFlag));
    }, [activeFlag, isLoggedIn]);

    return (
        <UserInfoContext.Provider value={{ isChangeUserInfo, setIsChangeUserInfo }}>
            <Router>
                <Routes>
                    <Route element={<PublicRoutes />}>
                        <Route path="/signin" element={<Signin setIsLoggedIn={() => setIsLoggedIn(!isLoggedIn)} />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                    </Route>
                    <Route element={<ProtectedRoutes />}>
                        {activeFlag === true ? (
                            <>
                                <Route
                                    path="/dashboard"
                                    element={
                                        getTempRole() === 'Moderator' || getTempRole() === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <Dashboard />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/departments"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <Department />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/departments/edit/:id"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <CreateDepartment title={'Chỉnh sửa phòng ban'} />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/departments/create"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <CreateDepartment title={'Thêm phòng ban mới'} />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route path="/users" element={<Navigate to="/users/all" />} />
                                <Route
                                    path="/users/all"
                                    element={
                                        userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <User />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/users/request-change"
                                    element={
                                        userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <RequestChange socket={socket} />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/users/edit/:id"
                                    element={
                                        userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <CreateUser title="Chỉnh sửa thành viên" />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/users/create"
                                    element={
                                        userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <CreateUser title="Thêm thành viên mới" />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route path="/documents" element={<Navigate to="/documents/documents-in" />} />
                                <Route
                                    path="/documents/detail/:id"
                                    element={
                                        <DefaultLayout socket={socket}>
                                            <DocumentDetail />
                                        </DefaultLayout>
                                    }
                                />
                                <Route
                                    path="/documents/documents-out"
                                    element={
                                        <DefaultLayout socket={socket}>
                                            <DocumentOut />
                                        </DefaultLayout>
                                    }
                                />
                                <Route
                                    path="/documents/documents-out/edit/:id"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <CreateDocument
                                                    inputLabel="đi"
                                                    socket={socket}
                                                    title="Sửa văn bản đi"
                                                    documentIn={false}
                                                    path="documents-out"
                                                />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/documents/documents-out/create"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <CreateDocument
                                                    inputLabel="đi"
                                                    socket={socket}
                                                    title="Thêm văn bản đi mới"
                                                    documentIn={false}
                                                    path="documents-out"
                                                />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/documents/documents-in"
                                    element={
                                        <DefaultLayout socket={socket}>
                                            <DocumentIn />
                                        </DefaultLayout>
                                    }
                                />
                                <Route
                                    path="/documents/documents-in/edit/:id"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <CreateDocument
                                                    inputLabel="đến"
                                                    socket={socket}
                                                    title="Sửa văn bản đến"
                                                    documentIn={true}
                                                    path="documents-in"
                                                />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/documents/documents-in/create"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <CreateDocument
                                                    inputLabel="đến"
                                                    socket={socket}
                                                    title="Thêm văn bản đến mới"
                                                    documentIn={true}
                                                    path="documents-in"
                                                />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/profile"
                                    element={
                                        <DefaultLayout socket={socket}>
                                            <Profile socket={socket} />
                                        </DefaultLayout>
                                    }
                                />
                                <Route
                                    path="/tasks"
                                    element={
                                        <DefaultLayout socket={socket}>
                                            <Task />
                                        </DefaultLayout>
                                    }
                                />
                                <Route
                                    path="/tasks/detail/:id"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <AdminTaskDetail socket={socket} />
                                            </DefaultLayout>
                                        ) : (
                                            <DefaultLayout socket={socket}>
                                                <MemberTaskDetail socket={socket} />
                                            </DefaultLayout>
                                        )
                                    }
                                />
                                <Route
                                    path="/tasks/create"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <CreateTask socket={socket} title="Thêm công việc mới" />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/tasks/edit/:id"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <CreateTask socket={socket} title="Chỉnh sửa công việc" />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route path="/statistics" element={<Navigate to="/statistics/documents" />} />
                                <Route
                                    path="/statistics/documents"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <DocumentStatistics />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/statistics/tasks"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <TaskStatistics />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                                <Route
                                    path="/statistics/systems"
                                    element={
                                        userRole === 'Moderator' || userRole === 'Admin' ? (
                                            <DefaultLayout socket={socket}>
                                                <SystemStatistics />
                                            </DefaultLayout>
                                        ) : (
                                            <Page404 />
                                        )
                                    }
                                />
                            </>
                        ) : (
                            <Route path="*" element={<BlockPage />} />
                        )}
                    </Route>
                    <Route path="*" element={<Page404 />} />
                    <Route path="/" element={<Navigate to="/signin" />} />
                </Routes>
            </Router>
        </UserInfoContext.Provider>
    );
};

export default App;
