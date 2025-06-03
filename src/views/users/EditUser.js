import React from 'react'
import {
  CForm,
  CFormInput,
  CFormSelect,
  CFormCheck,
  CRow,
  CCol,
  CButton,
  CCard,
  CCardBody,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { cilCalendar, cilPen } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const UserProfileForm = () => {
  return (
    <CCard className="p-3">
      <CCardBody>
        <CForm>
          {/* Profile Image Row */}
          <CRow className="mb-4 align-items-center">
            <CCol md={2} className="text-center">
              <div style={{ position: 'relative' }}>
                <img
                  src="https://via.placeholder.com/100"
                  alt="Profile"
                  className="rounded-circle border"
                  style={{ width: '100px', height: '100px' }}
                />
                <CButton
                  color="warning"
                  size="sm"
                  style={{ position: 'absolute', bottom: 0, right: 0, borderRadius: '50%' }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
              </div>
            </CCol>
            <CCol md={10}>
              <CRow>
                <CCol md={4}>
                  <CFormLabel>First Name</CFormLabel>
                  <CFormInput placeholder="First Name" />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Last Name</CFormLabel>
                  <CFormInput placeholder="Last Name" />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Gender</CFormLabel>
                  <div className="d-flex gap-3">
                    <CFormCheck type="radio" name="gender" label="Male" defaultChecked />
                    <CFormCheck type="radio" name="gender" label="Female" />
                  </div>
                </CCol>
              </CRow>
            </CCol>
          </CRow>

          {/* Contact Details Row */}
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Email</CFormLabel>
              <CFormInput placeholder="Email" type="email" />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Mobile No.</CFormLabel>
              <CFormInput placeholder="+92 334 1234567" />
            </CCol>
            <CCol md={4}>
              <CFormLabel>WhatsApp</CFormLabel>
              <CFormInput placeholder="+92 334 1234567" />
            </CCol>
          </CRow>

          {/* CNIC, DOB, City */}
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>CNIC</CFormLabel>
              <CFormInput placeholder="35201-1234567-8" />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Date of Birth</CFormLabel>
              <CInputGroup>
                <CFormInput type="date" />
                <CInputGroupText>
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
              </CInputGroup>
            </CCol>
            <CCol md={4}>
              <CFormLabel>City</CFormLabel>
              <CFormSelect>
                <option>Select</option>
                <option>Karachi</option>
                <option>Lahore</option>
              </CFormSelect>
            </CCol>
          </CRow>

          {/* Court License & Passwords */}
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Latest Court License</CFormLabel>
              <CFormSelect>
                <option>Select</option>
                <option>High Court</option>
                <option>Supreme Court</option>
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormLabel>Password</CFormLabel>
              <CFormInput type="password" />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Confirm Password</CFormLabel>
              <CFormInput type="password" />
            </CCol>
          </CRow>

          {/* Action Buttons */}
          <CRow className="justify-content-end mt-4">
            <CCol xs="auto">
              <CButton color="secondary" variant="outline">
                Cancel
              </CButton>
            </CCol>
            <CCol xs="auto">
              <CButton color="success" onClick={() => navigate('/users')}>
                Save
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default UserProfileForm
