import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CButton,
  CCard,
  CCardBody,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CToaster,
  CToast,
  CToastBody,
  CToastClose,
  CSpinner,
} from '@coreui/react'
import { cilCalendar, cilPen } from '@coreui/icons'
import { FaExclamationCircle } from 'react-icons/fa'
import CIcon from '@coreui/icons-react'
import { useGetDropdownsQuery, useCreateLawyerMutation } from '../../../services/api'

const LawyerProfileForm = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: dropdowns } = useGetDropdownsQuery('Gender,City,Court')
  const [createLawyer, { isLoading }] = useCreateLawyerMutation()
  const { lawyer, mode } = location.state || { mode: 'add' }
  const [submitError, setSubmitError] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    cnic: '',
    dob: '',
    gender_id: '',
    city: '',
    court_type_id: '',
    password: '',
    confirmPassword: '',
    image: 'profile-image.jpg',
  })

  useEffect(() => {
    if (mode === 'edit' && lawyer) {
      const formattedDob = lawyer.dob ? new Date(lawyer.dob).toISOString().split('T')[0] : ''

      setFormData({
        name: lawyer.name || '',
        email: lawyer.email || '',
        phone: lawyer.phone || '',
        whatsapp: lawyer.whatsapp || '',
        cnic: lawyer.cnic || '',
        dob: formattedDob,
        gender_id: lawyer.gender_id || '',
        city: lawyer.city || '',
        court_type_id: lawyer.court_type_id || '',
        password: '',
        confirmPassword: '',
        image: lawyer.image || 'profile-image.jpg',
      })
    }
  }, [lawyer, mode])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDropdownChange = (type, id) => {
    const key = type === 'Gender' ? 'gender_id' : type === 'City' ? 'city' : 'court_type_id'
    setFormData((prev) => ({
      ...prev,
      [key]: id,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      user_type: 'lawyer',
    }
    delete submitData.confirmPassword

    try {
      const response = await createLawyer(submitData).unwrap()
      if (response.success) {
        navigate('/lawyers', { state: { lawyerAdded: true } })
      } else {
        setSubmitError({ data: { message: response.message || 'Failed to save lawyer' } })
        setShowToast(true)
      }
    } catch (err) {
      setSubmitError(err)
      setShowToast(true)
    }
  }

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000) // 4 seconds
      return () => clearTimeout(timer)
    }
  }, [showToast])

  return (
    <>
      <CToaster placement="top-end" className="mt-4">
        {showToast && submitError && (
          <CToast
            autohide={false}
            color="danger"
            className="border-0 shadow-lg toast-slide-in"
            visible={true}
            style={{
              background: 'linear-gradient(135deg, #dc3545, #ff6f61)',
              color: '#fff',
              borderRadius: '0.75rem',
              padding: '0rem 1rem 0rem 1rem',
              minWidth: '320px',
            }}
          >
            <div className="d-flex align-items-center">
              <FaExclamationCircle size={22} className="me-3" />
              <CToastBody className="fw-semibold flex-grow-1">
                {submitError?.data?.message || 'Something went wrong!'}
              </CToastBody>
              <CToastClose
                className="ms-3 m-auto"
                style={{ color: '#fff' }}
                onClick={() => setShowToast(false)}
              />
            </div>
          </CToast>
        )}
      </CToaster>

      <CCard className="p-3">
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            {/* Profile Image Row */}
            <CRow className="mb-4 align-items-center">
              <CCol md={2} className="text-center">
                <div style={{ position: 'relative' }}>
                  <img
                    src={formData.image}
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
                  <CCol md={6}>
                    <CFormLabel>Name</CFormLabel>
                    <CFormInput
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Name"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Gender</CFormLabel>
                    <CFormSelect
                      name="gender"
                      value={formData.gender_id}
                      onChange={(e) => handleDropdownChange('Gender', e.target.value)}
                    >
                      <option value="">Select</option>
                      {dropdowns?.data
                        ?.filter((item) => item.type === 'Gender')
                        .map((gender) => (
                          <option key={gender?._id} value={gender?._id}>
                            {gender?.name}
                          </option>
                        ))}
                    </CFormSelect>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>

            {/* Contact Details Row */}
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  type="email"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Mobile No.</CFormLabel>
                <CFormInput
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="033601188315"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>WhatsApp</CFormLabel>
                <CFormInput
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="033601183315"
                />
              </CCol>
            </CRow>

            {/* CNIC, DOB, City */}
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>CNIC</CFormLabel>
                <CFormInput
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleInputChange}
                  placeholder="19014-1103121-1"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Date of Birth</CFormLabel>
                <CInputGroup>
                  <CFormInput
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    type="date"
                  />
                  <CInputGroupText>
                    <CIcon icon={cilCalendar} />
                  </CInputGroupText>
                </CInputGroup>
              </CCol>
              <CCol md={4}>
                <CFormLabel>City</CFormLabel>
                <CFormSelect
                  name="city"
                  value={formData.city}
                  onChange={(e) => handleDropdownChange('City', e.target.value)}
                >
                  <option value="">Select</option>
                  {dropdowns?.data
                    ?.filter((item) => item.type === 'City')
                    .map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.name}
                      </option>
                    ))}
                </CFormSelect>
              </CCol>
            </CRow>

            {/* Court License & Passwords */}
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>Latest Court License</CFormLabel>
                <CFormSelect
                  name="court_type_id"
                  value={formData.court_type_id}
                  onChange={(e) => handleDropdownChange('Court', e.target.value)}
                >
                  <option value="">Select</option>
                  {dropdowns?.data
                    ?.filter((item) => item.type === 'Court')
                    .map((court) => (
                      <option key={court._id} value={court._id}>
                        {court.name}
                      </option>
                    ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Password</CFormLabel>
                <CFormInput
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  type="password"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Confirm Password</CFormLabel>
                <CFormInput
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  type="password"
                />
              </CCol>
            </CRow>

            {/* Action Buttons */}
            <CRow className="justify-content-end mt-4">
              <CCol xs="auto">
                <CButton color="secondary" variant="outline" onClick={() => navigate('/lawyers')}>
                  Cancel
                </CButton>
              </CCol>
              <CCol xs="auto">
                <CButton color="success" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <CSpinner component="span" size="sm" aria-hidden="true" className="me-2" />
                      Saving...
                    </>
                  ) : mode === 'edit' ? (
                    'Update'
                  ) : (
                    'Save'
                  )}
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </>
  )
}

export default LawyerProfileForm
