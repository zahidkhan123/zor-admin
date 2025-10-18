import React, { useEffect, useRef, useState } from 'react'
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
import { cilCalendar, cilPen, cilCloudUpload } from '@coreui/icons'
import { FaExclamationCircle } from 'react-icons/fa'
import CIcon from '@coreui/icons-react'
import {
  useGetDropdownsQuery,
  useCreateLawyerMutation,
  useUploadImageMutation,
} from '../../../services/api'

const LawyerProfileForm = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: dropdowns } = useGetDropdownsQuery('Gender,Court')
  const [createLawyer, { isLoading }] = useCreateLawyerMutation()
  const [uploadImage] = useUploadImageMutation()
  const { lawyer, mode } = location.state || { mode: 'add' }
  const [submitError, setSubmitError] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [proofImage, setProofImage] = useState(null)
  const [proofImagePreview, setProofImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const proofInputRef = useRef(null)

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
    proof_file: null,
    key: '', // add key to put the file returned by server
  })

  // Show the selected proof image preview if it already exists (edit mode)
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
        proof_file: lawyer.proof_file || null,
        key: lawyer.proof_file || '', // in edit mode, set key as the existing proof_file
      })

      // If there's already a proof document url, set it as preview
      if (lawyer.proof_file) {
        setProofImage(lawyer.proof_file)
        setProofImagePreview(
          lawyer.proof_file.startsWith('http')
            ? lawyer.proof_file
            : `${process.env.REACT_APP_ASSETS_API_URL || ''}/${lawyer.proof_file}`,
        )
      } else {
        setProofImage(null)
        setProofImagePreview(null)
      }
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
    const key = type === 'Gender' ? 'gender_id' : 'court_type_id'
    setFormData((prev) => ({
      ...prev,
      [key]: id,
    }))
  }

  const handleCnicChange = (e) => {
    let value = e.target.value.replace(/\D/g, '') // remove non-digits
    if (value.length > 13) value = value.slice(0, 13)

    let formatted = value
    if (value.length > 5 && value.length <= 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(5, 12)}`
    }
    if (value.length > 12) {
      formatted = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`
    }

    setFormData((prev) => ({
      ...prev,
      cnic: formatted,
    }))
  }

  const extractRelativeKey = (absoluteUrl) => {
    if (!absoluteUrl) return ''
    const match = absoluteUrl.match(/(documents\/images\/[^\?]+)/)
    if (match && match[1]) {
      return match[1]
    }
    return absoluteUrl // fallback to original, in case format changes
  }

  // Proof image upload and preview
  const handleProofUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate image file
    if (!file.type.startsWith('image/')) {
      setSubmitError({ data: { message: 'Please select an image file.' } })
      setShowToast(true)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError({ data: { message: 'File size should be less than 5MB.' } })
      setShowToast(true)
      return
    }

    setUploadingImage(true)
    setProofImage(null)
    setProofImagePreview(null)

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setProofImagePreview(ev.target.result)
    reader.readAsDataURL(file)

    try {
      const fd = new FormData()
      fd.append('image', file)
      // Debug: indicate upload started
      if (process.env.NODE_ENV !== 'production') {
        console.log('Uploading proof image to API...', file?.name)
      }
      const res = await uploadImage(fd).unwrap()
      console.log('res', res)
      if (res?.success && res.data && res.data.url) {
        // Use the returned file key for future sending
        // Assume the API returns the key as res.data.key or the path in res.data.url
        let key = res.data.key || extractRelativeKey(res.data.url)
        setFormData((prev) => ({
          ...prev,
          key: key,
          proof_file: key, // also immediately set proof_file to key
        }))
        setProofImage(key)
        setProofImagePreview(res.data.url)
      } else {
        setSubmitError({
          data: { message: res?.message || 'Failed to upload the image. Please try again.' },
        })
        setShowToast(true)
        setProofImage(null)
        setProofImagePreview(null)
      }
    } catch (err) {
      setSubmitError({ data: { message: 'Failed to upload the image. Please try again.' } })
      setShowToast(true)
      setProofImage(null)
      setProofImagePreview(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password && formData.password.length < 4) {
      setSubmitError({ data: { message: 'Password must be at least 4 characters long.' } })
      setShowToast(true)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setSubmitError({ data: { message: 'Passwords do not match.' } })
      setShowToast(true)
      return
    }

    // Validation for required proof_file on add
    if (mode === 'add' && !formData.key) {
      setSubmitError({ data: { message: 'Proof image is required.' } })
      setShowToast(true)
      return
    }

    // Build submitData: put proof_file from key
    const submitData = {
      ...formData,
      proof_file: formData.key, // send what was put in key as proof_file
      user_type: 'lawyer',
    }

    delete submitData.confirmPassword
    delete submitData.key // don't send the separate key field

    try {
      const response = await createLawyer(submitData).unwrap()
      if (response && response.success) {
        navigate('/lawyers', { state: { lawyerAdded: true } })
      } else {
        setSubmitError({
          data: { message: (response && response.message) || 'Failed to save lawyer' },
        })
        setShowToast(true)
      }
    } catch (err) {
      setSubmitError(err)
      setShowToast(true)
    }
  }

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  return (
    <>
      {/* Toast Notifications */}
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
              padding: '0rem 1rem',
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

      {/* Main Form */}
      <CCard className="p-3">
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            {/* Profile Image */}
            <CRow className="mb-4 align-items-center">
              <CCol md={2} className="text-center">
                <div style={{ position: 'relative' }}>
                  <img
                    src={
                      formData.image && formData.image !== 'profile-image.jpg'
                        ? formData.image.startsWith('http')
                          ? formData.image
                          : `${process.env.REACT_APP_ASSETS_API_URL || ''}/${formData.image}`
                        : '/no-avatar.png'
                    }
                    alt="Profile"
                    className="rounded-circle border"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                  <CButton
                    color="warning"
                    size="sm"
                    style={{ position: 'absolute', bottom: 0, right: 0, borderRadius: '50%' }}
                    disabled
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

            {/* Contact Details */}
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email"
                  placeholder="Email"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Mobile No.</CFormLabel>
                <CFormInput
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.length <= 11) handleInputChange(e)
                  }}
                  type="number"
                  placeholder="03069161679"
                  maxLength={11}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>WhatsApp</CFormLabel>
                <CFormInput
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.length <= 11) handleInputChange(e)
                  }}
                  type="number"
                  placeholder="03069161679"
                  maxLength={11}
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
                  onChange={handleCnicChange}
                  placeholder="19014-1103121-1"
                  maxLength={15}
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
                <CFormInput
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />
              </CCol>
            </CRow>

            {/* Court & Passwords */}
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
                  minLength={4}
                  onChange={handleInputChange}
                  type="password"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Confirm Password</CFormLabel>
                <CFormInput
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  minLength={4}
                  onChange={handleInputChange}
                  type="password"
                />
              </CCol>
            </CRow>

            {/* Upload Proof */}
            <CRow className="mb-4">
              <CCol md={12}>
                <CFormLabel>Upload Proof Document</CFormLabel>
                <div className="d-flex flex-column align-items-start">
                  {proofImagePreview ? (
                    <div style={{ width: '300px', position: 'relative' }}>
                      <img
                        src={proofImagePreview}
                        alt="Proof preview"
                        className="img-fluid rounded border"
                        style={{
                          maxHeight: '150px',
                          width: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      {uploadingImage && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25 rounded">
                          <CSpinner size="sm" className="text-white" />
                        </div>
                      )}
                      <div className="mt-2 d-flex gap-2 flex-wrap">
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="outline"
                          onClick={() => document.getElementById('proofUpload').click()}
                          disabled={uploadingImage}
                        >
                          Change Document
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          onClick={() => {
                            setProofImage(null)
                            setProofImagePreview(null)
                            setFormData((prev) => ({
                              ...prev,
                              proof_file: '',
                              key: '',
                            }))
                          }}
                          disabled={uploadingImage}
                        >
                          Remove
                        </CButton>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="d-flex flex-column align-items-center justify-content-center rounded-3 border py-4 px-3"
                      style={{
                        borderStyle: 'dashed',
                        backgroundColor: '#fffdfa',
                        minHeight: '150px',
                        width: '300px',
                        cursor: 'pointer',
                      }}
                      onClick={() => proofInputRef.current && proofInputRef.current.click()}
                    >
                      {uploadingImage ? (
                        <div className="text-center">
                          <CSpinner size="sm" />
                          <div className="mt-2 small text-muted">Uploading...</div>
                        </div>
                      ) : (
                        <>
                          <CIcon icon={cilCloudUpload} className="text-warning mb-2" size="xl" />
                          <div className="text-center">
                            <div className="small fw-medium text-dark">
                              Click to upload proof document
                            </div>
                            <div className="small text-muted">PNG, JPG up to 5MB</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    id="proofUpload"
                    name="proof"
                    accept="image/*"
                    onChange={handleProofUpload}
                    className="d-none"
                    disabled={uploadingImage}
                    ref={proofInputRef}
                  />
                </div>
              </CCol>
            </CRow>

            {/* Submit Buttons */}
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
                      <CSpinner component="span" size="sm" className="me-2" />
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
