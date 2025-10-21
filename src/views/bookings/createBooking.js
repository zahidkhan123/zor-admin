import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { cilCloudUpload, cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  useGetCategoriesQuery,
  useGetCitiesQuery,
  useGetLawyersByCategoryQuery,
  useGetAvailableSlotsQuery,
  useGetUsersQuery,
  useUploadImageMutation,
  useGetReasonsDropdownQuery,
  useGetVideoPreferenceDropdownQuery,
  useCreateBookingMutation,
} from '../../services/api'

const CreateBooking = () => {
  const [formData, setFormData] = useState({
    category: '',
    city: '',
    lawyer: '',
    lawyerId: '',
    consultationType: '',
    location: '',
    date: '',
    time: '',
    mobile: '',
    payment: 'online',
    reason: '',
    videoPreference: '',
  })

  const [lawyerSearch, setLawyerSearch] = useState('')
  const [selectedLawyer, setSelectedLawyer] = useState(null)
  const [consultationTypes, setConsultationTypes] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [showLawyerDropdown, setShowLawyerDropdown] = useState(false)
  const [debouncedLawyerSearch, setDebouncedLawyerSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [proofImage, setProofImage] = useState(null)
  const [proofImagePreview, setProofImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // API queries
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery()
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery()
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useGetUsersQuery({ page: 1, limit: 10, search: userSearch || '' })
  const {
    data: lawyersData,
    isLoading: lawyersLoading,
    error: lawyersError,
  } = useGetLawyersByCategoryQuery(
    {
      category: formData.category,
      city: formData.city,
      page: 1,
      limit: 50,
      query: debouncedLawyerSearch || undefined,
    },
    { skip: !formData.category },
  )
  const { data: slotsData, isLoading: slotsLoading } = useGetAvailableSlotsQuery(
    {
      day: formData.date
        ? new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' })
        : '',
      location: formData.location,
      lawyer_id: formData?.lawyerId,
    },
    { skip: !formData.date || !formData.location || !formData.lawyerId },
  )
  const [uploadImage] = useUploadImageMutation()
  const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation()

  // Dropdown queries
  const { data: reasonsData, isLoading: reasonsLoading } = useGetReasonsDropdownQuery()
  const { data: videoPreferenceData, isLoading: videoPreferenceLoading } =
    useGetVideoPreferenceDropdownQuery()
  // Debug: Log API responses
  useEffect(() => {
    // [Debug logs omitted]
  }, [
    lawyersData,
    lawyersError,
    categoriesData,
    citiesData,
    formData,
    lawyersLoading,
    categoriesLoading,
    citiesLoading,
    usersData,
    usersLoading,
    usersError,
  ])

  useEffect(() => {
    if (selectedLawyer && selectedLawyer.appointment_location) {
      setConsultationTypes(selectedLawyer.appointment_location)
    }
  }, [selectedLawyer])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLawyerSearch(lawyerSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [lawyerSearch])

  useEffect(() => {
    if (slotsData) {
      setAvailableSlots(slotsData?.data || [])
    }
  }, [slotsData])

  // Handle changes and resets for dependent fields
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'category' || name === 'city') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        lawyer: '',
        lawyerId: '',
        consultationType: '',
        location: '',
        date: '',
        time: '',
      }))
      setSelectedLawyer(null)
      setConsultationTypes([])
      setAvailableSlots([])
      setShowLawyerDropdown(false)
      return
    }

    if (name === 'lawyer') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        consultationType: '',
        location: '',
        date: '',
        time: '',
      }))
      setConsultationTypes([])
      setAvailableSlots([])
      return
    }

    if (name === 'consultationType') {
      let selectedType = consultationTypes.find((type) => type.title === value)
      if (!selectedType && lawyersData?.data?.lawyers?.length > 0) {
        for (const lawyer of lawyersData.data.lawyers) {
          selectedType = (lawyer.appointment_location || []).find((t) => t.title === value)
          if (selectedType) {
            setSelectedLawyer(lawyer)
            setConsultationTypes(lawyer.appointment_location)
            setFormData((prev) => ({
              ...prev,
              lawyer: lawyer.user.lawyer_name,
              lawyerId: lawyer.user._id,
              consultationType: value,
              location: selectedType.title || '',
              time: '',
              reason: '',
              videoPreference: '',
              // Auto-switch to online payment if consultation type is online and cash was selected
              payment:
                value.toLowerCase().includes('online') && prev.payment === 'cash'
                  ? 'online'
                  : prev.payment,
            }))
            setAvailableSlots([])
            return
          }
        }
      }

      if (selectedType) {
        setFormData((prev) => ({
          ...prev,
          lawyer:
            selectedType?.user?.lawyer_name || selectedLawyer?.user?.lawyer_name || prev.lawyer,
          lawyerId: selectedType?.user?._id || selectedLawyer?.user?._id || prev.lawyerId,
          consultationType: value,
          location: selectedType?.title || '',
          time: '',
          reason: '',
          videoPreference: '',
          // Auto-switch to online payment if consultation type is online and cash was selected
          payment:
            value.toLowerCase().includes('online') && prev.payment === 'cash'
              ? 'online'
              : prev.payment,
        }))
        setAvailableSlots([])
      } else {
        setFormData((prev) => ({
          ...prev,
          consultationType: value,
          reason: '',
          videoPreference: '',
          // Auto-switch to online payment if consultation type is online and cash was selected
          payment:
            value.toLowerCase().includes('online') && prev.payment === 'cash'
              ? 'online'
              : prev.payment,
        }))
        setAvailableSlots([])
      }
      return
    }

    if (name === 'date') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        time: '',
      }))
      setAvailableSlots([])
      return
    }

    // Standard update case
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handlers for searching/selecting users & lawyers
  const handleLawyerSearch = (e) => {
    setLawyerSearch(e.target.value)
    setShowLawyerDropdown(true)
  }
  const handleLawyerInputClick = () => {
    if (formData.category) setShowLawyerDropdown(true)
  }
  const handleLawyerSelect = (lawyer) => {
    setSelectedLawyer(lawyer)
    setConsultationTypes(lawyer.appointment_location)
    setFormData((prev) => ({
      ...prev,
      lawyer: lawyer.user.lawyer_name,
      lawyerId: lawyer.user._id,
      consultationType: '',
      location: '',
      date: '',
      time: '',
    }))
    setLawyerSearch('')
    setShowLawyerDropdown(false)
  }
  const handleUserSearch = (e) => {
    setUserSearch(e.target.value)
    setShowUserDropdown(true)
  }
  const handleUserInputClick = () => {
    setShowUserDropdown(true)
  }
  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setFormData((prev) => ({
      ...prev,
      userId: user._id,
      mobile: user.phone || prev.mobile,
    }))
    setUserSearch('')
    setShowUserDropdown(false)
  }

  // File upload logic for proof image
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB')
      return
    }

    setProofImage(file)
    setUploadingImage(true)
    // Preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setProofImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)

    try {
      // FormData for upload
      const formDataObj = new FormData()
      formDataObj.append('image', file)
      // Upload
      const response = await uploadImage(formDataObj).unwrap()
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          proofImageUrl: response.data.url,
          proofImageKey: response.data.key,
        }))
      }
    } catch (error) {
      alert('Failed to upload image. Please try again.')
      setProofImage(null)
      setProofImagePreview(null)
    } finally {
      setUploadingImage(false)
    }
  }

  // Close dropdowns if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.lawyer-search-container')) {
        setShowLawyerDropdown(false)
      }
      if (!event.target.closest('.user-search-container')) {
        setShowUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (
      !formData.category ||
      !formData.city ||
      !formData.lawyerId ||
      !formData.consultationType ||
      !formData.date ||
      !formData.time
    ) {
      alert('Please fill in all required fields')
      return
    }
    if (!selectedUser) {
      alert('Please select a user for the booking')
      return
    }

    // Validate online consultation fields
    const isOnline = formData.consultationType.toLowerCase().includes('online')
    if (isOnline) {
      if (!formData.reason || !formData.videoPreference) {
        alert('Please select both reason and video preference for online consultation')
        return
      }
      debugger
      // Proof image is REQUIRED for online booking
      if (!formData.proofImageUrl) {
        alert('Please upload proof image for online booking.')
        return
      }
    }
    debugger
    try {
      // Find the selected consultation type to get the location ID
      const selectedConsultationType = consultationTypes.find(
        (type) => type.title === formData.consultationType,
      )

      // Find the selected slot ID
      const selectedSlot = availableSlots.find((slot) => slot.name === formData.time)

      // Find the reason ID
      const selectedReason = reasonsData?.data?.find((reason) => reason.name === formData.reason)

      // Find the video preference ID
      const selectedVideoPreference = videoPreferenceData?.data?.find(
        (preference) => preference.name === formData.videoPreference,
      )

      // Build the request body according to the API specification
      // Fix: reason_id must be an array according to server response

      // If booking is online, proof_url is always required.
      let bookingFields = {
        lawyer_id: formData.lawyerId,
        appointment_type: isOnline ? 'online' : 'physical',
        date: formData.date,
        slot_id: selectedSlot?._id || selectedSlot?.id,
        lawyer_location_id: selectedConsultationType?._id || selectedConsultationType?.id,
        app_version: '1.0.5',
        platform: 'admin',
        // Only include proof_url if present for offline, always for online (checked above)
        ...(isOnline && { proof_url: formData.proofImageKey }),
        // Add online-specific fields only if consultation type is online
        ...(isOnline && {
          video_preference_id: selectedVideoPreference?._id || selectedVideoPreference?.id,
          reason_id:
            selectedReason && (selectedReason._id || selectedReason.id)
              ? [selectedReason._id || selectedReason.id]
              : [],
        }),
      }
      let paymentFields = {
        payable_amount: selectedConsultationType?.fee || 0,
        payment_type: formData.payment,
        total_amount: selectedConsultationType?.fee || 0,
      }
      debugger
      const requestBody = {
        user_id: selectedUser._id,
        booking: bookingFields,
        payment: paymentFields,
      }

      console.log('Creating booking with data:', requestBody)

      // Call the API
      const response = await createBooking(requestBody).unwrap()

      if (response.success) {
        alert('Booking created successfully!')
        // Reset form or redirect as needed
        console.log('Booking created:', response.data)
      } else {
        alert('Failed to create booking: ' + (response.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert(
        'Failed to create booking: ' + (error.data?.message || error.message || 'Unknown error'),
      )
    }
  }

  return (
    <CContainer className="py-4">
      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-white">
          <h5 className="mb-0 fw-semibold">Manual Booking Creation</h5>
          <p className="text-body-secondary small mb-0">
            Create a manual booking by selecting category, lawyer, and schedule.
          </p>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            {/* Row 0: User Search & Selection */}
            <CRow className="mb-4">
              <CCol md={12}>
                <CFormLabel>Search & Select User</CFormLabel>
                <div className="position-relative user-search-container">
                  <CFormInput
                    type="text"
                    placeholder="Search by name, phone or email..."
                    value={userSearch}
                    onChange={handleUserSearch}
                    onClick={handleUserInputClick}
                    className="pe-5"
                  />
                  <CIcon
                    icon={cilSearch}
                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-body-secondary"
                  />
                  {showUserDropdown && (
                    <div
                      className="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-sm"
                      style={{ zIndex: 1000 }}
                    >
                      {usersLoading ? (
                        <div className="p-3 text-center">
                          <CSpinner size="sm" />
                          <span className="ms-2">Loading users...</span>
                        </div>
                      ) : usersError ? (
                        <div className="p-3 text-danger">
                          Error loading users: {usersError.message || 'Unknown error'}
                        </div>
                      ) : usersData?.data?.users?.length > 0 ? (
                        usersData.data.users
                          .filter((user) => {
                            if (!userSearch) return true
                            const haystack = `${user?.name || ''} ${user?.phone || ''} ${
                              user?.email || ''
                            }`.toLowerCase()
                            return haystack.includes(userSearch.toLowerCase())
                          })
                          .map((user) => (
                            <div
                              key={user._id}
                              className="p-3 border-bottom cursor-pointer hover-bg-light"
                              onClick={() => handleUserSelect(user)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="fw-semibold">{user?.name || 'Unnamed User'}</div>
                              <div className="text-body-secondary small">
                                {user?.email || 'no-email'} • {user?.phone || 'no-phone'}
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="p-3 text-body-secondary">No users found</div>
                      )}
                    </div>
                  )}
                </div>
                {selectedUser && (
                  <div className="mt-2 p-3 bg-light rounded">
                    <div className="fw-semibold">Selected: {selectedUser?.name}</div>
                    <div className="text-body-secondary small">
                      {selectedUser?.email} • {selectedUser?.phone}
                    </div>
                  </div>
                )}
              </CCol>
            </CRow>
            {/* Row 1: Category & City */}
            <CRow className="mb-4">
              <CCol md={6}>
                <CFormLabel>Select Category</CFormLabel>
                <CFormSelect name="category" value={formData.category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  {categoriesLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    categoriesData?.data?.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))
                  )}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Select City</CFormLabel>
                <CFormSelect name="city" value={formData.city} onChange={handleChange}>
                  <option value="">Select City</option>
                  {citiesLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    citiesData?.data?.map((city) => (
                      <option key={city._id} value={city.name}>
                        {city.name}
                      </option>
                    ))
                  )}
                </CFormSelect>
              </CCol>
            </CRow>
            {/* Row 2: Lawyer Search & Selection */}
            <CRow className="mb-4">
              <CCol md={12}>
                <CFormLabel>Search & Select Lawyer</CFormLabel>
                <div className="position-relative lawyer-search-container">
                  <CFormInput
                    type="text"
                    placeholder={
                      formData.category ? 'Search lawyers...' : 'Select a category first'
                    }
                    value={lawyerSearch}
                    onChange={handleLawyerSearch}
                    onClick={handleLawyerInputClick}
                    className="pe-5"
                    disabled={!formData.category}
                  />
                  <CIcon
                    icon={cilSearch}
                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-body-secondary"
                  />
                  {showLawyerDropdown && formData.category && (
                    <div
                      className="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-sm"
                      style={{ zIndex: 1000 }}
                    >
                      {lawyersLoading ? (
                        <div className="p-3 text-center">
                          <CSpinner size="sm" />
                          <span className="ms-2">Loading lawyers...</span>
                        </div>
                      ) : lawyersError ? (
                        <div className="p-3 text-danger">
                          Error loading lawyers: {lawyersError.message || 'Unknown error'}
                        </div>
                      ) : lawyersData?.data?.lawyers?.length > 0 ? (
                        lawyersData.data.lawyers
                          .filter((lawyer) => {
                            if (!lawyerSearch) return true
                            return (lawyer?.user?.lawyer_name)
                              .toLowerCase()
                              .includes(lawyerSearch.toLowerCase())
                          })
                          .map((lawyer) => (
                            <div
                              key={lawyer._id}
                              className="p-3 border-bottom cursor-pointer hover-bg-light"
                              onClick={() => handleLawyerSelect(lawyer)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="fw-semibold">{lawyer?.user?.lawyer_name}</div>
                              <div className="text-body-secondary small">
                                {lawyer.specializations
                                  .map((specialization) => specialization.name)
                                  .join(', ') || 'Lawyer'}
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="p-3 text-body-secondary">
                          {!formData.category
                            ? 'Please select a category first'
                            : 'No lawyers found'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {!formData.category && (
                  <div className="mt-2 text-muted small">
                    <CIcon icon={cilSearch} className="me-1" />
                    Please select a category above to search for lawyers
                  </div>
                )}
                {selectedLawyer && (
                  <div className="mt-2 p-3 bg-light rounded">
                    <div className="fw-semibold">
                      Selected:{' '}
                      {selectedLawyer.user.lawyer_name ||
                        `${selectedLawyer.user} ${selectedLawyer.lastName}`}
                    </div>
                    <div className="text-body-secondary small">
                      {selectedLawyer.specializations
                        .map((specialization) => specialization.name)
                        .join(', ') || 'Lawyer'}
                    </div>
                  </div>
                )}
              </CCol>
            </CRow>
            {/* Row 3: Consultation Type & Schedule */}
            <CRow className="mb-4">
              <CCol md={6}>
                <CFormLabel>Select Consultation Type</CFormLabel>
                <CFormSelect
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleChange}
                >
                  <option value="">Select Consultation Type</option>
                  {consultationTypes.map((type) => (
                    <option key={type._id} value={type.title}>
                      {type.title} - Rs. {type.fee} ({type.availability})
                    </option>
                  ))}
                </CFormSelect>
                {formData.consultationType && (
                  <div className="mt-2">
                    {consultationTypes
                      .filter((type) => type.title === formData.consultationType)
                      .map((type) => (
                        <div key={type._id} className="small text-body-secondary">
                          <div>
                            <strong>Location:</strong> {type.address || 'N/A'}
                          </div>
                          <div>
                            <strong>City:</strong> {type.city}
                          </div>
                          <div>
                            <strong>Fee:</strong> Rs. {type.fee}
                          </div>
                          <div>
                            <strong>Availability:</strong> {type.availability}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Select Date</CFormLabel>
                <CFormInput
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </CCol>
            </CRow>

            {/* Online Consultation Additional Fields */}
            {formData.consultationType &&
              formData.consultationType.toLowerCase().includes('online') && (
                <CRow className="mb-4">
                  <CCol md={6}>
                    <CFormLabel>Reason for Consultation</CFormLabel>
                    <CFormSelect name="reason" value={formData.reason} onChange={handleChange}>
                      <option value="">Select Reason</option>
                      {reasonsLoading ? (
                        <option disabled>Loading...</option>
                      ) : (
                        reasonsData?.data?.map((reason) => (
                          <option key={reason._id} value={reason.name}>
                            {reason.name}
                          </option>
                        ))
                      )}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>Video Preference</CFormLabel>
                    <CFormSelect
                      name="videoPreference"
                      value={formData.videoPreference}
                      onChange={handleChange}
                    >
                      <option value="">Select Video Preference</option>
                      {videoPreferenceLoading ? (
                        <option disabled>Loading...</option>
                      ) : (
                        videoPreferenceData?.data?.map((preference) => (
                          <option key={preference._id} value={preference.name}>
                            {preference.name}
                          </option>
                        ))
                      )}
                    </CFormSelect>
                  </CCol>
                </CRow>
              )}
            {/* Row 4: Time Slot Selection */}
            {formData.date && formData.consultationType && (
              <CRow className="mb-4">
                <CCol md={12}>
                  <CFormLabel>Select Time Slot</CFormLabel>
                  {slotsLoading ? (
                    <div className="text-center p-3">
                      <CSpinner size="sm" />
                      <span className="ms-2">Loading available slots...</span>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <CRow className="g-2">
                      {availableSlots.map((slot, idx) => {
                        const isSelected = formData.time === slot?.name
                        return (
                          <CCol key={idx} xs="auto" className="p-1">
                            <div
                              style={{
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                background: isSelected
                                  ? 'linear-gradient(135deg, rgba(255, 214, 51, 0.17) 0%, rgba(248,249,250,0.95) 100%)'
                                  : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
                                color: isSelected ? '#9d7d00' : '#000',
                                border: isSelected ? '2px solid #ffc107' : '1px solid #ddd',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                boxShadow: isSelected
                                  ? '0 2px 6px rgba(255, 193, 7, 0.3)'
                                  : undefined,
                                outline: isSelected ? '2px solid #ffc107' : undefined,
                              }}
                              onClick={() => setFormData((prev) => ({ ...prev, time: slot?.name }))}
                            >
                              {slot?.name}
                            </div>
                          </CCol>
                        )
                      })}
                    </CRow>
                  ) : (
                    <CAlert color="warning">
                      No available slots for the selected date and consultation type.
                    </CAlert>
                  )}
                </CCol>
              </CRow>
            )}

            {/* =========================
     ROW 1 — Mobile & Payment
========================= */}
            <CRow className="gy-4 gx-4 mb-4">
              {/* -- MOBILE NUMBER -- */}
              <CCol lg={6} md={6} sm={12}>
                <div className="d-flex flex-column h-10 justify-content-between">
                  <CFormLabel className="fw-semibold mb-2">Mobile No.</CFormLabel>
                  <CFormInput
                    type="text"
                    name="mobile"
                    placeholder="Enter mobile number"
                    value={formData.mobile}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      fontSize: '1rem',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #f6bd60',
                      background: '#fffdfa',
                      boxShadow: '0 1px 4px rgba(246,189,96,.06)',
                    }}
                  />
                </div>
              </CCol>

              {/* -- PAYMENT OPTIONS -- */}
              <CCol lg={6} md={6} sm={12}>
                <div className="d-flex flex-column h-100 justify-content-between">
                  <CFormLabel className="fw-semibold mb-2">Payment Options</CFormLabel>
                  <div className="d-flex flex-column gap-3">
                    {/* Online Payment Option */}
                    <div
                      onClick={() => setFormData((prev) => ({ ...prev, payment: 'online' }))}
                      className={`d-flex align-items-center justify-content-between px-3 py-2 rounded-4 border cursor-pointer ${
                        formData.payment === 'online'
                          ? 'bg-warning-subtle border-warning shadow-sm'
                          : 'border-light bg-white'
                      }`}
                      style={{
                        minHeight: '46px',
                        borderWidth: '2px',
                        transition: '0.25s ease',
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className={`rounded-circle border ${
                            formData.payment === 'online'
                              ? 'border-warning bg-warning'
                              : 'border-2 border-secondary-subtle bg-white'
                          }`}
                          style={{ width: '16px', height: '16px' }}
                        ></div>
                        <span className="small fw-medium" style={{ fontSize: '1rem' }}>
                          Online Payment
                        </span>
                      </div>
                      <span className="fw-semibold text-dark" style={{ fontSize: '1rem' }}>
                        Rs.
                        {consultationTypes.find((type) => type.title === formData.consultationType)
                          ?.fee || '0'}
                      </span>
                    </div>

                    {/* Cash Option */}
                    <div
                      onClick={
                        formData.consultationType &&
                        formData.consultationType.toLowerCase().includes('online')
                          ? undefined
                          : () => setFormData((prev) => ({ ...prev, payment: 'cash' }))
                      }
                      className={`d-flex align-items-center justify-content-between px-3 py-2 rounded-4 border ${
                        formData.consultationType &&
                        formData.consultationType.toLowerCase().includes('online')
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer'
                      } ${
                        formData.payment === 'cash'
                          ? 'bg-warning-subtle border-warning shadow-sm'
                          : 'border-light bg-white'
                      }`}
                      style={{
                        minHeight: '46px',
                        borderWidth: '2px',
                        transition: '0.25s ease',
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className={`rounded-circle border ${
                            formData.payment === 'cash'
                              ? 'border-warning bg-warning'
                              : 'border-2 border-secondary-subtle bg-white'
                          }`}
                          style={{ width: '16px', height: '16px' }}
                        ></div>
                        <span className="small fw-medium" style={{ fontSize: '1rem' }}>
                          Cash
                        </span>
                      </div>
                      <span className="fw-semibold text-dark" style={{ fontSize: '1rem' }}>
                        Rs.
                        {consultationTypes.find((type) => type.title === formData.consultationType)
                          ?.fee || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </CCol>
            </CRow>

            {/* =========================
     ROW 2 — Upload Proof
========================= */}
            <CRow className="gy-4 gx-4 mb-4">
              <CCol lg={6} md={8} sm={12}>
                <CFormLabel className="fw-semibold mb-2">Upload Proof</CFormLabel>
                <div className="d-flex flex-column align-items-start">
                  {proofImagePreview ? (
                    <div style={{ width: '220px', position: 'relative' }}>
                      <img
                        src={proofImagePreview}
                        alt="Proof preview"
                        className="img-fluid rounded border"
                        style={{
                          maxHeight: '120px',
                          width: '100%',
                          objectFit: 'cover',
                          boxShadow: '0 4px 16px rgba(255,193,7,0.06)',
                          border: '2px solid #f6bd60',
                        }}
                      />
                      {proofImage && formData.proofImageUrl && (
                        <div className="mt-2 p-2 bg-success-subtle rounded border border-success w-100">
                          <div className="small text-success fw-medium">
                            ✓ Proof image uploaded successfully
                          </div>
                          <div className="small text-muted">File: {proofImage.name}</div>
                        </div>
                      )}
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
                          Change Image
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
                              proofImageUrl: '',
                              proofImageKey: '',
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
                      className="d-flex flex-column align-items-center justify-content-center rounded-3 border py-3 px-2"
                      style={{
                        borderStyle: 'dashed',
                        borderColor: '#f6bd60',
                        backgroundColor: '#fffdfa',
                        minHeight: '120px',
                        width: '220px',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s',
                        boxShadow: '0 1px 6px rgba(246,189,96,.08)',
                      }}
                      onClick={() => document.getElementById('proofUpload').click()}
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
                            <div className="small fw-medium text-dark">Click to upload proof</div>
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
                    onChange={handleFileUpload}
                    className="d-none"
                    disabled={uploadingImage}
                  />
                </div>
              </CCol>
            </CRow>

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-3">
              <CButton color="secondary" variant="outline">
                Cancel
              </CButton>
              {/* <CButton color="secondary" variant="outline">
                Save as Draft
              </CButton> */}
              <CButton color="dark" type="submit" disabled={isCreatingBooking}>
                {isCreatingBooking ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default CreateBooking
