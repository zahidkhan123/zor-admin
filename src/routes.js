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

const LawyersList = React.lazy(() => import('./views/lawyers/allLawyers/AllLawyer'))
const LawyersStatusView = React.lazy(() => import('./views/lawyers/allLawyers/ViewLawyer'))

const ProfileSetup = React.lazy(() => import('./views/lawyers/ProfileSetupStatus/AllLawyer'))
const ViewProfileSetup = React.lazy(() => import('./views/lawyers/ProfileSetupStatus/ViewLawyer'))

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
  /*Bookings routes */
}
const Bookings = React.lazy(() => import('./views/bookings/bookings'))
const BookingDetail = React.lazy(() => import('./views/bookings/BookingDetail'))
const CreateBooking = React.lazy(() => import('./views/bookings/createBooking'))
{
  /*Finance routes */
}
const Finance = React.lazy(() => import('./views/finance/finance'))
const FinanceDetail = React.lazy(() => import('./views/finance/financeDetail'))

const routes = [
  // { path: '/', exact: true, name: 'Home' },
  { path: '/', exact: true, name: 'Home', element: Dashboard },

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
  { path: '/lawyers-list', name: 'Lawyers List', element: LawyersList },
  { path: '/lawyers-list/view/:id', name: 'View Lawyer', element: LawyersStatusView },
  { path: '/profile-setup', name: 'Profile Setup', element: ProfileSetup },
  { path: '/profile-setup/view/:id', name: 'View Profile Setup', element: ViewProfileSetup },

  { path: '/verification', name: 'Verification', element: Verification },
  { path: '/verification/detail/:id', name: 'Verification Detail', element: VerificationDetail },

  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/profile/detail/:id', name: 'Profile Detail', element: ProfileDetail },
  { path: '/profile/edit/:id', name: 'Profile Edit', element: ProfileEdit },
  { path: '/profile/add', name: 'Profile Add', element: ProfileEdit },
  { path: '/profile/set-availability', name: 'Set Availability', element: SetAvailability },
  { path: '/profile/view-availability', name: 'View Availability', element: ViewAvailability },
  { path: '/bookings', name: 'Bookings', element: Bookings },
  { path: '/bookings/detail/:id', name: 'Booking Detail', element: BookingDetail },
  // { path: '/bookings/create', name: 'Create Booking', element: CreateBooking },
  { path: '/finance', name: 'Finance', element: Finance },
  { path: '/finance/detail/:id', name: 'Finance Detail', element: FinanceDetail },
]

export default routes
