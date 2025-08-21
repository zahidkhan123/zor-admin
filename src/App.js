import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'
import Dashboard from './views/dashboard/Dashboard'
// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))

{
  /*User routes */
}
const Users = React.lazy(() => import('./views/users/Users'))
const UserEdit = React.lazy(() => import('./views/users/EditUser'))
const UserView = React.lazy(() => import('./views/users/ViewUser'))

{
  /*Registration Request routes */
}
const RegistrationRequests = React.lazy(() => import('./views/lawyers/registrations/lawyers'))
const RegistrationView = React.lazy(() => import('./views/lawyers/registrations/ViewLawyer'))
{
  /*Verification routes */
}
const Verification = React.lazy(() => import('./views/lawyers/verification/Verification'))
const VerificationDetail = React.lazy(
  () => import('./views/lawyers/verification/VerificationDetail'),
)

{
  /*Profile routes */
}
const Profile = React.lazy(() => import('./views/lawyers/profile/Profile'))
const ProfileDetail = React.lazy(() => import('./views/lawyers/profile/ViewProfile'))
const ProfileEdit = React.lazy(() => import('./views/lawyers/profile/EditProfile'))
const SetAvailability = React.lazy(() => import('./views/lawyers/profile/SetAvailability'))
const ViewAvailability = React.lazy(() => import('./views/lawyers/profile/viewAvailabiity'))
{
  /*Lawyer routes */
}
const AllLawyer = React.lazy(() => import('./views/lawyers/lawyers/AllLawyer'))
const LawyerProfileForm = React.lazy(() => import('./views/lawyers/lawyers/EditLawyer'))
const LawyerView = React.lazy(() => import('./views/lawyers/lawyers/ViewLawyer'))
const LawyersList = React.lazy(() => import('./views/lawyers/allLawyers/AllLawyer'))
const LawyersView = React.lazy(() => import('./views/lawyers/allLawyers/ViewLawyer'))
const ProfileSetup = React.lazy(() => import('./views/lawyers/ProfileSetupStatus/AllLawyer'))
const ViewProfileSetup = React.lazy(() => import('./views/lawyers/ProfileSetupStatus/ViewLawyer'))

{
  /*Bookings routes */
}
const Bookings = React.lazy(() => import('./views/bookings/bookings'))
const BookingDetail = React.lazy(() => import('./views/bookings/BookingDetail'))

// Components
const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login" name="Login Page" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DefaultLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            {/* <Route path="theme/colors" element={<Colors />} /> */}
            {/* User routes */}
            <Route path="users" element={<Users />} />
            <Route path="users/add" element={<UserEdit mode="add" />} />
            <Route path="users/edit/:id" element={<UserEdit mode="edit" />} />
            <Route path="users/view/:id" element={<UserView />} />
            {/* Registration Request routes */}
            <Route path="registration" element={<RegistrationRequests />} />
            <Route path="registration/view/:id" element={<RegistrationView />} />
            {/* Verification routes */}
            <Route path="verification" element={<Verification />} />
            <Route path="verification/detail/:id" element={<VerificationDetail />} />
            {/* Profile routes */}
            <Route path="profile" element={<Profile />} />
            <Route path="profile/detail/:id" element={<ProfileDetail />} />
            <Route path="profile/edit/:id" element={<ProfileEdit />} />
            <Route path="profile/add" element={<ProfileEdit />} />
            <Route path="profile/set-availability" element={<SetAvailability />} />
            <Route path="profile/view-availability" element={<ViewAvailability />} />
            {/* Lawyer routes */}
            <Route path="lawyers" element={<AllLawyer />} />
            <Route path="lawyers/add" element={<LawyerProfileForm />} />
            <Route path="lawyers/edit/:id" element={<LawyerProfileForm />} />
            <Route path="lawyers/view/:id" element={<LawyerView />} />
            <Route path="lawyers-list" element={<LawyersList />} />
            <Route path="lawyers-list/view/:id" element={<LawyersView />} />

            <Route path="profile-setup" element={<ProfileSetup />} />
            <Route path="profile-setup/view/:id" element={<ViewProfileSetup />} />
            {/* Bookings routes */}
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/detail/:id" element={<BookingDetail />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Page404 />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
