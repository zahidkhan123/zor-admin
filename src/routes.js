import { elements } from 'chart.js'
import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

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
// const UserEdit = React.lazy(() => import('./views/users/EditUser'))
// const UserView = React.lazy(() => import('./views/users/ViewUser'))

{
  /*Lawyer routes */
}
const AllLawyer = React.lazy(() => import('./views/lawyers/lawyers/AllLawyer'))
const LawyerProfileForm = React.lazy(() => import('./views/lawyers/lawyers/EditLawyer'))
const LawyerView = React.lazy(() => import('./views/lawyers/lawyers/ViewLawyer'))

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

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  { path: '/users', name: 'Users', element: Users },
  { path: '/users/add', name: 'Add User', element: UserEdit },
  { path: '/users/edit/:id', name: 'Edit User', element: UserEdit },
  { path: '/users/view/:id', name: 'View User', element: UserView },

  { path: '/registration', name: 'Registration Requests', element: RegistrationRequests },
  { path: '/registration/view/:id', name: 'View Registration', element: RegistrationView },

  { path: '/lawyers', name: 'Lawyers', element: AllLawyer },
  { path: '/lawyers/add', name: 'Add Lawyer', element: LawyerProfileForm },
  { path: '/lawyers/edit/:id', name: 'Edit Lawyer', element: LawyerProfileForm },
  { path: '/lawyers/view/:id', name: 'View Lawyer', element: LawyerView },

  { path: '/verification', name: 'Verification', element: Verification },
  { path: '/verification/detail/:id', name: 'Verification Detail', element: VerificationDetail },

  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/profile/detail/:id', name: 'Profile Detail', element: ProfileDetail },
  { path: '/profile/edit/:id', name: 'Profile Edit', element: ProfileEdit },
  { path: '/profile/add', name: 'Profile Add', element: ProfileEdit },
]

export default routes
