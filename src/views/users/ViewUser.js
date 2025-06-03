// views/users/UserView.jsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'

const UserView = () => {
  const { id } = useParams()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // fetch user by id
    setUser({
      name: 'John Doe',
      phone: '+1 234 567 890',
      email: 'john@example.com',
      age: '30',
      gender: 'Male',
    })
  }, [id])

  if (!user) return <p>Loading...</p>

  return (
    <CCard>
      <CCardHeader>User Details</CCardHeader>
      <CCardBody>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Age:</strong> {user.age}
        </p>
        <p>
          <strong>Gender:</strong> {user.gender}
        </p>
      </CCardBody>
    </CCard>
  )
}

export default UserView
