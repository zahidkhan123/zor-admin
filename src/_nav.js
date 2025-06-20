import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilSpeedometer, cilUserPlus, cilSettings } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Lawyers Dashboard',
    to: '/lawyers',
    icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Registration Requests',
        to: '/registration',
      },
      {
        component: CNavItem,
        name: 'Verification Process',
        to: '/verification',
      },
      {
        component: CNavItem,
        name: 'Profile',
        to: '/profile',
      },
      {
        component: CNavItem,
        name: 'All Lawyers',
        to: '/lawyers',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Admin',
    to: '/role-management',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
]

export default _nav
