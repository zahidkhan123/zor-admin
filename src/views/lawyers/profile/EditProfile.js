import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CFormInput,
  CFormSelect,
  CCardHeader,
  CImage,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CFormCheck,
  CBadge,
  CToaster,
  CToast,
  CToastHeader,
  CToastBody,
  CSpinner,
} from '@coreui/react'
import { CFormLabel, CFormTextarea } from '@coreui/react'
import { cilMap, cilPencil, cilPlus, cilX, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  useGetCategoriesQuery,
  useGetLawyerByIdQuery,
  useGetFeeandlocationQuery,
  useGetCitiesQuery,
  useUpdateFeeandlocationMutation,
  useUpdateLawyerProfileMutation,
} from '../../../services/api.js'
import { useParams } from 'react-router-dom'
import { fetchSignedUrl, fetchMultipleSignedUrls } from '../../../assets/utils/imageUtils'
import { useNavigate } from 'react-router-dom'

// Algolia search import
import { search } from '../../../algolia/search'

// Generic ListSection for all list-based fields
const ListSection = ({
  title,
  placeholder,
  items,
  onAdd,
  onRemove,
  onSearch,
  filteredItems,
  error,
  customInputFields,
  addButtonLabel,
  renderItem,
}) => {
  const [input, setInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Debounce search
  useEffect(() => {
    if (onSearch && input.trim()) {
      const handler = setTimeout(() => {
        onSearch(input.trim())
        setShowDropdown(true)
      }, 400)
      return () => clearTimeout(handler)
    } else if (onSearch) {
      setShowDropdown(false)
    }
  }, [input, onSearch])

  // For custom input fields (like education/case)
  const [customInputs, setCustomInputs] = useState({})

  const handleCustomInputChange = (field, value) => {
    setCustomInputs((prev) => ({ ...prev, [field]: value }))
  }

  const handleCustomAdd = () => {
    if (customInputFields && onAdd) {
      onAdd(customInputs)
      setCustomInputs({})
    }
  }

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="bg-warning text-white py-3">
        <h5 className="mb-0 fw-semibold" style={{ color: '#000' }}>
          {title}
        </h5>
      </CCardHeader>
      <CCardBody className="p-4">
        {customInputFields ? (
          <CRow className="mb-3 g-2">
            {customInputFields.map((field) => (
              <CCol key={field.name}>
                <CFormInput
                  placeholder={field.placeholder}
                  value={customInputs[field.name] || ''}
                  onChange={(e) => handleCustomInputChange(field.name, e.target.value)}
                  className={error && !customInputs[field.name] ? 'border-danger' : ''}
                  type={field.type || 'text'}
                />
              </CCol>
            ))}
            <CCol md="auto">
              <CButton color="warning" onClick={handleCustomAdd}>
                <CIcon icon={cilPlus} /> {addButtonLabel || 'Add'}
              </CButton>
            </CCol>
          </CRow>
        ) : (
          <div className="d-flex gap-2 mb-4 position-relative">
            <CFormInput
              placeholder={placeholder}
              className={`flex-grow-1 border-2${error ? ' border-danger' : ''}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              style={{ color: '#000' }}
              onFocus={() => {
                if (onSearch && input.trim()) setShowDropdown(true)
              }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            <CButton
              color="warning"
              size="sm"
              className="d-flex align-items-center gap-1 px-4 py-2 fw-semibold"
              onClick={() => {
                if (input.trim()) {
                  onAdd(input.trim())
                  setInput('')
                  setShowDropdown(false)
                }
              }}
            >
              <CIcon icon={cilPlus} className="fs-5" />
              <span style={{ color: '#000' }}>Add</span>
            </CButton>
            {/* Dropdown for Algolia search results */}
            {onSearch && showDropdown && filteredItems && filteredItems.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: 4,
                  maxHeight: 200,
                  overflowY: 'auto',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  color: '#000',
                }}
              >
                {filteredItems.map((item, idx) => (
                  <div
                    key={item.name + idx}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: idx === filteredItems.length - 1 ? 'none' : '1px solid #ccc',
                      color: '#000',
                    }}
                    onMouseDown={() => {
                      onAdd(item.name)
                      setInput('')
                      setShowDropdown(false)
                    }}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="text-danger mb-1" style={{ fontSize: 13 }}>
            {error}
          </div>
        )}
        <div className="mb-3">
          <h6 className="text-muted mb-3" style={{ color: '#000' }}>
            Selected Items:
          </h6>
          <div className="d-flex flex-wrap gap-2">
            {(items || [])
              .map((item, idx) => ({ ...item, _actualIndex: idx }))
              .filter((item) => !item.isDeleted)
              .map((item) =>
                renderItem ? (
                  renderItem(item, () => onRemove(item._actualIndex))
                ) : (
                  <CButton
                    color="secondary"
                    className="d-flex align-items-center px-3 py-2"
                    shape="rounded-pill"
                    key={item._id || item._actualIndex}
                    onClick={() => onRemove(item._actualIndex)}
                    style={{ color: '#000' }}
                  >
                    <span className="me-1" style={{ color: '#000' }}>
                      {typeof item === 'object' ? item.name : item}
                    </span>
                    <CIcon icon={cilX} className="fs-6" />
                  </CButton>
                ),
              )}
          </div>
        </div>
      </CCardBody>
    </CCard>
  )
}

// Updated location and fee types to match API response
const LOCATION_TYPES = {
  HOME: 'Home Location',
  PERSONAL_OFFICE: 'Personal Office Location',
  CHAMBER: 'Chamber Location',
  OFFICE: 'Office Location',
  ONLINE: 'Online Location',
}

const FEE_TYPES = {
  ONLINE: 'Online Consultation',
  CHAMBER: 'Chamber Office',
  OFFICE: 'Office',
  HOME: 'Home Office',
}

// Define all possible location types for mapping, even if empty
const ALL_LOCATION_TYPES = [
  { type: 'Home', label: 'Home Location' },
  { type: 'Office', label: 'Personal Office Location' },
  { type: 'Chamber', label: 'Chamber Location' },
  // { type: 'Online', label: 'Online Location' }, // Exclude online if not needed
]

const EditProfile = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: categoriesData } = useGetCategoriesQuery()
  const { data: lawyerData } = useGetLawyerByIdQuery(id, { skip: !id })
  const { data: citiesData } = useGetCitiesQuery()
  const { data: feesandlocationData } = useGetFeeandlocationQuery(id, { skip: !id })
  const [updateFeeandlocation] = useUpdateFeeandlocationMutation()
  const [updateLawyerProfile] = useUpdateLawyerProfileMutation()
  const [name, setName] = useState('')
  const [category, setCategory] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])

  // Track removed categories for payload
  const [removedCategories, setRemovedCategories] = useState([])

  const [specializations, setSpecializations] = useState([])
  const [services, setServices] = useState([])
  const [experience, setExperience] = useState([])
  const [cases, setCases] = useState([])
  const [languages, setLanguages] = useState([])
  const [memberships, setMemberships] = useState([])

  const [educationList, setEducationList] = useState([])

  const [profileImage, setProfileImage] = useState('')
  const [certificateList, setCertificateList] = useState([])

  // Loader and toast state
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastColor, setToastColor] = useState('success')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingLocations, setIsSavingLocations] = useState(false)

  // Micro validation error states
  const [categoryError, setCategoryError] = useState('')
  const [specializationsError, setSpecializationsError] = useState('')
  const [servicesError, setServicesError] = useState('')
  const [educationError, setEducationError] = useState('')

  // For new API: locations is an array, not an object
  const [locations, setLocations] = useState([])

  // For new API: city is a city_id string
  const [selectedCity, setSelectedCity] = useState('')

  // Fees state, now includes 'office'
  const [fees, setFees] = useState({
    online: '',
    chamber: '',
    home: '',
    office: '',
  })

  // Algolia filtered results for services and specializations
  const [filteredSpecializations, setFilteredSpecializations] = useState([])
  const [filteredServices, setFilteredServices] = useState([])

  // Algolia filterResults function
  const filterResults = useCallback(
    async (text, title, setFiltered) => {
      // selectedCategories is array of category objects
      const selectedCategoryNames = selectedCategories
        .filter((item) => !item.isDeleted)
        ?.map((item) => item.name)
      let collection = []
      for (let catName of selectedCategoryNames) {
        const categoryId = categoriesData?.data?.find((item) => item.name === catName)?._id
        if (!text || !categoryId) {
          setFiltered([])
          continue
        }
        // Search in both specializations and services indexes
        const [specializationsResults, servicesResults] = await Promise.all([
          search(text, 'specializations', categoryId),
          search(text, 'services', categoryId),
        ])
        // Merge and format results from both indexes
        const mergedResults = [...(specializationsResults || []), ...(servicesResults || [])]
        const internalCollection = mergedResults?.map((item) => {
          return {
            name: item.name,
          }
        })
        collection = [...collection, ...internalCollection]
      }
      setFiltered(collection)
    },
    [selectedCategories, categoriesData],
  )

  // Keep a ref of initial categories to help with removal tracking
  const initialCategoriesRef = useRef([])

  useEffect(() => {
    if (lawyerData?.data?.lawyer?.user?.image) {
      fetchSignedUrl(lawyerData.data.lawyer.user.image)
        .then((url) => setProfileImage(url))
        .catch((error) => {
          console.error('Error fetching image:', error)
        })
    }
  }, [lawyerData])

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!lawyerData?.data?.lawyer?.certificates?.length) return
      try {
        const urls = await Promise.all(
          lawyerData.data.lawyer.certificates
            .filter(Boolean)
            .map((cert) => fetchSignedUrl(cert.fileUrl)),
        )
        setCertificateList(urls.filter(Boolean))
      } catch (error) {
        console.error('Error fetching certificate URLs:', error)
      }
    }

    fetchCertificates()
  }, [lawyerData?.data?.lawyer?.certificates])

  useEffect(() => {
    if (lawyerData?.data?.lawyer) {
      const l = lawyerData.data.lawyer

      setName(l.user.name || '')

      // Categories
      const categories = Array.isArray(l.categories) ? l.categories : []
      setCategory(categories.map((c) => c._id))
      setSelectedCategories(categories)
      initialCategoriesRef.current = categories // Save initial categories for removal tracking
      setRemovedCategories([]) // Reset removed categories on load

      // Specializations
      setSpecializations(
        Array.isArray(l.specializations)
          ? l.specializations.map((s) => ({
              _id: s._id,
              name: s.name,
              isDeleted: false,
            }))
          : [],
      )

      // Services
      setServices(
        Array.isArray(l.services)
          ? l.services.map((s) => ({
              _id: s._id,
              name: s.name,
              isDeleted: false,
            }))
          : [],
      )

      // Experience
      setExperience(
        Array.isArray(l.experience)
          ? l.experience.map((e) => ({
              _id: e._id,
              name: e.name,
              isDeleted: false,
            }))
          : [],
      )

      // Cases
      setCases(
        Array.isArray(l.renouncedCases)
          ? l.renouncedCases.map((c) => ({
              _id: c._id,
              caseTitle: c.caseTitle,
              caseYear: c.caseYear,
              courtLicense: c.courtLicense,
              caseLink: c.caseLink,
              isDeleted: false,
            }))
          : [],
      )

      // Languages
      setLanguages(
        Array.isArray(l.languages)
          ? l.languages.map((lng) => ({
              _id: lng._id,
              name: lng.name,
              isDeleted: false,
            }))
          : [],
      )

      // Memberships
      setMemberships(
        Array.isArray(l.memberships)
          ? l.memberships.map((m) => ({
              _id: m._id,
              name: m.name,
              isDeleted: false,
            }))
          : [],
      )

      // Education
      setEducationList(
        Array.isArray(l.education)
          ? l.education.map((edu) => ({
              _id: edu._id,
              name: edu.name,
              completionYear: edu.completionYear,
              isDeleted: false,
            }))
          : [],
      )
    }

    // Map new API response for fee and location
    if (feesandlocationData?.data) {
      // Map city from first location with city_id, if available
      const locationsArr = Array.isArray(feesandlocationData.data.location)
        ? feesandlocationData.data.location
        : []

      // Filter out 'online' locations
      const filteredLocations = locationsArr.filter(
        (loc) => loc.type !== 'online' && loc.city_id !== null,
      )
      // Find first location with city_id for selectedCity
      const cityLocation = filteredLocations.find((loc) => loc.city_id)
      setSelectedCity(cityLocation?.city_id || '')
      // --- Begin: Always map all location types, even if empty ---
      // For each type in ALL_LOCATION_TYPES, find the location or create an empty one
      const mappedLocations = ALL_LOCATION_TYPES.map((locType) => {
        // Try to find a location of this type
        const found = filteredLocations.find(
          (loc) => (loc.type || '').toLowerCase() === locType.type.toLowerCase(),
        )
        if (found) {
          return found
        }
        // If not found, return an empty location object for this type
        return {
          location_id: `${locType.type.toLowerCase()}`,
          type: locType.type,
          city_id: selectedCity || '',
          address: '',
          directionNotes: '',
          area: '', // Add area field for UI consistency
        }
      })

      setLocations(mappedLocations)
      // --- End: Always map all location types, even if empty ---

      // Map fees
      if (feesandlocationData.data.fee) {
        setFees({
          online: feesandlocationData.data.fee.online || '',
          chamber: feesandlocationData.data.fee.chamber || '',
          home: feesandlocationData.data.fee.home || '',
          office: feesandlocationData.data.fee.office || '',
        })
      }
    } else {
      // If no data, still map all location types as empty
      const mappedLocations = ALL_LOCATION_TYPES.map((locType) => ({
        location_id: `${locType.type.toLowerCase()}-empty`,
        type: locType.type,
        city_id: selectedCity || '',
        address: '',
        directionNotes: '',
        area: '', // Add area field for UI consistency
      }))
      setLocations(mappedLocations)
    }
  }, [lawyerData, feesandlocationData])

  useEffect(() => {
    if (lawyerData?.data?.lawyer?.categories) {
      const preselected = lawyerData.data.lawyer.categories
      setCategory(preselected.map((cat) => cat._id))
      setSelectedCategories(preselected)
      initialCategoriesRef.current = preselected
      setRemovedCategories([])
    }
  }, [lawyerData])

  // Micro validation for categories, services, specializations, education
  // Run on every change
  useEffect(() => {
    // Categories: at least 1, at most 2, and must be unique
    const uniqueCatIds = Array.from(new Set(selectedCategories.map((c) => c._id)))
    if (uniqueCatIds.length < 1) {
      setCategoryError('Please select at least one category.')
    } else if (uniqueCatIds.length > 2) {
      setCategoryError('You can select at most two unique categories.')
    } else {
      setCategoryError('')
    }
  }, [selectedCategories])

  useEffect(() => {
    // Specializations: at least 1
    if (specializations.filter((s) => !s.isDeleted).length === 0) {
      setSpecializationsError('Please add at least one specialization.')
    } else {
      setSpecializationsError('')
    }
  }, [specializations])

  useEffect(() => {
    // Services: at least 1
    if (services.filter((s) => !s.isDeleted).length === 0) {
      setServicesError('Please add at least one service.')
    } else {
      setServicesError('')
    }
  }, [services])

  useEffect(() => {
    // Education: at least 1
    if (educationList.filter((e) => !e.isDeleted).length === 0) {
      setEducationError('Please add at least one education entry.')
    } else {
      setEducationError('')
    }
  }, [educationList])

  // --- FIX: Remove by actual index, not filtered index ---
  const handleAdd = (setFunc, list) => (val) => {
    if (val && typeof val === 'object') {
      // For custom input fields (education, cases)
      setFunc([...list, { ...val, isDeleted: false }])
    } else if (val && val.trim) {
      setFunc([...list, { name: val.trim(), isDeleted: false }])
    }
  }

  const handleRemove = (setFunc, list) => (actualIndex) => {
    setFunc((prev) => {
      const updated = [...prev]
      if (updated[actualIndex]?._id) {
        updated[actualIndex].isDeleted = true
      } else {
        updated.splice(actualIndex, 1)
      }
      return updated
    })
  }

  // --- CATEGORY REMOVE/ADD LOGIC FOR PAYLOAD ---

  // Helper to get category object by _id from categoriesData
  const getCategoryById = (id) => {
    return categoriesData?.data?.find((cat) => cat._id === id)
  }

  // Remove category logic: mark as removed for payload
  const handleRemoveCategory = (catToRemove) => {
    setCategory((prev) => prev.filter((id) => id !== catToRemove._id))
    setSelectedCategories((prev) => prev.filter((c) => c._id !== catToRemove._id))
    // If the removed category was in the initial categories, add to removedCategories if not already present
    if (
      initialCategoriesRef.current.some((cat) => cat._id === catToRemove._id) &&
      !removedCategories.some((cat) => cat._id === catToRemove._id)
    ) {
      setRemovedCategories((prev) => [...prev, { ...catToRemove, isDeleted: true }])
    }
  }

  // Add category logic: add to selectedCategories, remove from removedCategories if present
  const handleAddCategory = (catToAdd) => {
    // Only add if not already present and if less than 2 unique categories
    const alreadySelected = selectedCategories.some((c) => c._id === catToAdd._id)
    const uniqueCatIds = Array.from(new Set(selectedCategories.map((c) => c._id)))
    if (!alreadySelected && uniqueCatIds.length < 2) {
      setCategory((prev) => [...prev, catToAdd._id])
      setSelectedCategories((prev) => [...prev, catToAdd])
      // If this category was previously removed, remove it from removedCategories
      setRemovedCategories((prev) => prev.filter((cat) => cat._id !== catToAdd._id))
    }
  }

  // Certificates logic
  const handleAddCertificate = (fileUrl) => {
    setCertificateList((prev) => [...prev, { fileUrl, isDeleted: false }])
  }
  const handleRemoveCertificate = (actualIndex) => {
    setCertificateList((prev) => {
      const updated = [...prev]
      if (updated[actualIndex]?._id) {
        updated[actualIndex].isDeleted = true
      } else {
        updated.splice(actualIndex, 1)
      }
      return updated
    })
  }

  // Location handlers for array of locations
  const handleLocationChange = (location_id, field, value) => {
    setLocations((prev) => {
      return prev.map((loc) => (loc.location_id === location_id ? { ...loc, [field]: value } : loc))
    })
  }

  // Fee handlers
  const handleFeeChange = (feeType, value) => {
    if (value === '' || parseInt(value) > 0) {
      setFees((prev) => ({
        ...prev,
        [feeType]: value,
      }))
    }
  }

  // --- REWRITE: Custom categories payload as per requirements ---
  const handleSave = async () => {
    // Micro validation before save
    let hasError = false
    const uniqueCatIds = Array.from(new Set(selectedCategories.map((c) => c._id)))
    if (uniqueCatIds.length < 1) {
      setCategoryError('Please select at least one category.')
      hasError = true
    }
    if (uniqueCatIds.length > 2) {
      setCategoryError('You can select at most two unique categories.')
      hasError = true
    }
    if (specializations.filter((s) => !s.isDeleted).length === 0) {
      setSpecializationsError('Please add at least one specialization.')
      hasError = true
    }
    if (services.filter((s) => !s.isDeleted).length === 0) {
      setServicesError('Please add at least one service.')
      hasError = true
    }
    if (educationList.filter((e) => !e.isDeleted).length === 0) {
      setEducationError('Please add at least one education entry.')
      hasError = true
    }
    if (hasError) return

    setIsSavingProfile(true)
    setToastVisible(false)

    // Build categories payload:
    // - All currently selected categories (with isDeleted if present)
    // - All removed categories (with isDeleted: true)
    // - If a category is both in selected and removed, only keep the selected (i.e., not deleted)
    // - If a category is new (not in initialCategoriesRef), just add as normal

    // 1. Build a map of selected categories by _id
    const selectedMap = {}
    selectedCategories.forEach((cat) => {
      selectedMap[cat._id] = { ...cat, isDeleted: !!cat.isDeleted }
    })

    // 2. Add removed categories (isDeleted: true) if not in selected
    removedCategories.forEach((cat) => {
      if (!selectedMap[cat._id]) {
        selectedMap[cat._id] = { ...cat, isDeleted: true }
      }
    })

    // 3. Build the final array, but only include up to 2 unique categories (enforced above)
    const categoriesPayload = Object.values(selectedMap)
      .filter((cat, idx, arr) => {
        // Only keep up to 2 unique categories (by _id)
        if (!cat.isDeleted) {
          // Only count non-deleted
          const nonDeleted = arr.filter((c) => !c.isDeleted)
          return nonDeleted.findIndex((c) => c._id === cat._id) === idx
        }
        return true // keep deleted for payload
      })
      .map((cat) => ({
        name: cat.name,
        ...(cat.isDeleted && { _id: cat._id, isDeleted: true }),
      }))

    // Optionally, include image_url if you have it (for now, using profileImage if available)
    let image_url = ''
    if (
      lawyerData?.data?.lawyer?.user?.image &&
      typeof lawyerData.data.lawyer.user.image === 'string'
    ) {
      image_url = lawyerData.data.lawyer.user.image
    }

    const payload = {
      ...(educationList.length > 0 && {
        education: educationList.map((edu) => ({
          ...(edu.name && { name: edu.name }),
          ...(edu.completionYear && { completionYear: Number(edu.completionYear) }),
          ...(edu._id && { _id: edu._id }),
          ...(edu.isDeleted !== undefined && { isDeleted: edu.isDeleted }),
        })),
      }),
      ...(cases.length > 0 && {
        renouncedCases: cases.map((c) => ({
          ...(c.caseTitle && { caseTitle: c.caseTitle }),
          ...(c.caseYear && { caseYear: Number(c.caseYear) }),
          ...(c.courtLicense && { courtLicense: c.courtLicense }),
          ...(c.caseLink && { caseLink: c.caseLink }),
          ...(c._id && { _id: c._id }),
          ...(c.isDeleted !== undefined && { isDeleted: c.isDeleted }),
        })),
      }),
      ...(experience.length > 0 && {
        experience: experience.map((e) => ({
          ...(e._id && { _id: e._id }),
          name: e.name,
          ...(e.isDeleted !== undefined && { isDeleted: e.isDeleted }),
        })),
      }),
      ...(memberships.length > 0 && {
        memberships: memberships.map((m) => ({
          ...(m._id && { _id: m._id }),
          name: m.name,
          ...(m.isDeleted !== undefined && { isDeleted: m.isDeleted }),
        })),
      }),
      // --- Custom categories object as per requirements ---
      ...(categoriesPayload.length > 0 && {
        categories: {
          ...(image_url && { image_url }),
          categories: categoriesPayload,
        },
      }),
      ...(languages.length > 0 && {
        languages: languages.map((l) => ({
          ...(l._id && { _id: l._id }),
          name: l.name,
          ...(l.isDeleted !== undefined && { isDeleted: l.isDeleted }),
        })),
      }),
      ...(specializations.length > 0 && {
        specializations: specializations.map((s) => ({
          ...(s._id && { _id: s._id }),
          name: s.name,
          ...(s.isDeleted !== undefined && { isDeleted: s.isDeleted }),
        })),
      }),
      ...(services.length > 0 && {
        services: services.map((s) => ({
          ...(s._id && { _id: s._id }),
          name: s.name,
          ...(s.isDeleted !== undefined && { isDeleted: s.isDeleted }),
        })),
      }),
      // ...(certificateList.length > 0 && {
      //   certificates: certificateList.map((cert) => ({
      //     ...(cert._id && { _id: cert._id }),
      //     fileUrl: cert.fileUrl,
      //     ...(cert.isDeleted !== undefined && { isDeleted: cert.isDeleted }),
      //   })),
      // }),
    }
    debugger
    const payloadData = {
      lawyer_id: id,
      lawyer_data: payload,
    }
    debugger
    try {
      const res = await updateLawyerProfile(payloadData)
      if (res?.data?.success) {
        setToastMessage('Lawyer profile updated successfully!')
        setToastColor('success')
        setToastVisible(true)
      } else {
        setToastMessage(
          res?.error?.data?.message || res?.data?.message || 'Failed to update lawyer profile',
        )
        setToastColor('danger')
        setToastVisible(true)
      }
    } catch (err) {
      setToastMessage('Failed to update lawyer profile')
      setToastColor('danger')
      setToastVisible(true)
    } finally {
      setIsSavingProfile(false)
    }
  }

  // --- REWRITE: Save Locations and Fees with area field and correct structure ---
  const handleSaveLocationsAndFees = async () => {
    setIsSavingLocations(true)
    setToastVisible(false)
    // Helper to get location_id by type
    const getLocationIdByType = (type) => {
      switch ((type || '').toLowerCase()) {
        case 'home':
          return '677d1ace0166c7338518f889'
        case 'office':
          return '677d1ad70166c7338518f88b'
        case 'chamber':
          return '677d1adf0166c7338518f88d'
        default:
          return type ? type.toLowerCase() : ''
      }
    }

    const filteredLocations = locations
      .filter(
        (loc) =>
          loc.type &&
          loc.type.toLowerCase() !== 'online' &&
          loc.address !== undefined &&
          loc.directionNotes !== undefined,
      )
      .map((loc) => ({
        location_id: getLocationIdByType(loc.type),
        city_id: selectedCity,
        area: loc.area || '', // area field, default to empty string if not present
        address: loc.address,
        directionNotes: loc.directionNotes,
      }))

    const payload = {
      lawyer_locations: filteredLocations,
      lawyer_fee: {
        online: fees.online ? parseInt(fees.online) : 0,
        chamber: fees.chamber ? parseInt(fees.chamber) : 0,
        office: fees.office ? parseInt(fees.office) : 0,
        home: fees.home ? parseInt(fees.home) : 0,
      },
    }
    try {
      const res = await updateFeeandlocation({ id, payload })
      if (res?.data?.success) {
        setToastMessage('Locations and fees updated successfully!')
        setToastColor('success')
        setToastVisible(true)
      } else {
        setToastMessage(
          res?.error?.data?.message || res?.data?.message || 'Failed to update locations and fees',
        )
        setToastColor('danger')
        setToastVisible(true)
      }
    } catch (err) {
      setToastMessage('Failed to update locations and fees')
      setToastColor('danger')
      setToastVisible(true)
    } finally {
      setIsSavingLocations(false)
    }
  }

  // Helper for city dropdown options
  const cityOptions = [
    { label: 'Select your city', value: '' },
    ...(citiesData?.data
      ? citiesData.data.map((city) => ({
          label: city.name,
          value: city._id,
        }))
      : []),
  ]

  return (
    <CContainer className="py-4">
      <CToaster position="top-end" className="mt-4">
        {toastVisible && (
          <CToast
            autohide={true}
            visible={true}
            color={toastColor}
            onClose={() => setToastVisible(false)}
          >
            <CToastHeader closeButton>
              <strong className="me-auto">{toastColor === 'success' ? 'Success' : 'Error'}</strong>
            </CToastHeader>
            <CToastBody>{toastMessage}</CToastBody>
          </CToast>
        )}
      </CToaster>
      <CCard>
        <CCardHeader className="bg-warning text-white">
          <h4 className="mb-0">Lawyer Profile</h4>
        </CCardHeader>
        <CCardBody>
          <CRow className="align-items-center mb-4">
            <CCol xs={12} md="auto" className="text-center mb-4 mb-md-0 position-relative">
              <div className="position-relative d-inline-block">
                {profileImage ? (
                  <CImage
                    src={profileImage}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      backgroundColor: '#e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CIcon icon={cilUser} size="xl" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setProfileImage(reader.result)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  style={{ display: 'none' }}
                  id="profile-image-input"
                />
                <CButton
                  color="secondary"
                  size="sm"
                  className="position-absolute bottom-0 end-0"
                  onClick={() => document.getElementById('profile-image-input').click()}
                >
                  <CIcon icon={cilPencil} />
                </CButton>
              </div>
            </CCol>
            <CCol>
              <CRow className="g-3">
                <CCol md={6} className="position-relative">
                  <CFormInput
                    placeholder="Type Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pe-5"
                  />
                </CCol>
                <CCol md={6}>
                  <div>
                    <CDropdown className="mb-2">
                      <CDropdownToggle
                        color={categoryError ? 'danger' : 'secondary'}
                        aria-label="Select Categories"
                        style={categoryError ? { border: '1px solid #dc3545' } : {}}
                      >
                        {category.length > 0 ? `${category.length} selected` : 'Select Categories'}
                      </CDropdownToggle>
                      <CDropdownMenu style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {categoriesData?.data?.map((cat) => {
                          const isSelected = category.includes(cat._id)
                          const uniqueCatIds = Array.from(new Set(category))
                          const isMaxSelected = uniqueCatIds.length >= 2 && !isSelected
                          return (
                            <div key={cat._id} className="px-3 py-1">
                              <CFormCheck
                                id={`cat-${cat._id}`}
                                label={cat.name}
                                value={cat._id}
                                checked={isSelected}
                                disabled={isMaxSelected}
                                onChange={(e) => {
                                  const selectedId = e.target.value
                                  const selectedCat = categoriesData.data.find(
                                    (c) => c._id === selectedId,
                                  )

                                  if (e.target.checked && !isSelected && uniqueCatIds.length < 2) {
                                    handleAddCategory(selectedCat)
                                  } else if (!e.target.checked && isSelected) {
                                    // Remove category
                                    handleRemoveCategory(selectedCat)
                                  }
                                }}
                              />
                            </div>
                          )
                        })}
                      </CDropdownMenu>
                    </CDropdown>
                    {/* Error message if required */}
                    {categoryError && (
                      <div className="text-danger" style={{ fontSize: 13 }}>
                        {categoryError}
                      </div>
                    )}
                  </div>

                  {/* Selected categories display */}
                  {selectedCategories.length > 0 && (
                    <div className="mt-2">
                      <h6 className="text-muted mb-2">Selected Categories:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedCategories.map((cat) => (
                          <CBadge
                            color="warning"
                            className="px-3 py-2 rounded-pill d-flex align-items-center"
                            key={cat._id}
                            style={{ cursor: 'pointer' }}
                          >
                            {cat.name}
                            <CIcon
                              icon={cilX}
                              className="ms-2"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                // Remove category when badge X is clicked
                                handleRemoveCategory(cat)
                              }}
                            />
                          </CBadge>
                        ))}
                      </div>
                    </div>
                  )}
                </CCol>
              </CRow>
            </CCol>
          </CRow>

          <ListSection
            title="Specialization"
            placeholder="Add new specialization"
            items={specializations}
            onAdd={handleAdd(setSpecializations, specializations)}
            onRemove={handleRemove(setSpecializations, specializations)}
            onSearch={(text) => filterResults(text, 'specializations', setFilteredSpecializations)}
            filteredItems={filteredSpecializations}
            error={specializationsError}
          />
          <ListSection
            title="Services"
            placeholder="Add new service"
            items={services}
            onAdd={handleAdd(setServices, services)}
            onRemove={handleRemove(setServices, services)}
            onSearch={(text) => filterResults(text, 'services', setFilteredServices)}
            filteredItems={filteredServices}
            error={servicesError}
          />
          <ListSection
            title="Experience"
            placeholder="Add new experience"
            items={experience}
            onAdd={handleAdd(setExperience, experience)}
            onRemove={handleRemove(setExperience, experience)}
          />
          <ListSection
            title="Languages"
            placeholder="Add new language"
            items={languages}
            onAdd={handleAdd(setLanguages, languages)}
            onRemove={handleRemove(setLanguages, languages)}
          />
          <ListSection
            title="Memberships"
            placeholder="Add new membership"
            items={memberships}
            onAdd={handleAdd(setMemberships, memberships)}
            onRemove={handleRemove(setMemberships, memberships)}
          />

          {/* Education */}
          <ListSection
            title="Education"
            items={educationList}
            onAdd={(val) => {
              // val: { degree, year, university }
              if (val.degree && val.year && val.university) {
                const newEdu = {
                  name: `${val.degree}, ${val.university}`,
                  completionYear: parseInt(val.year) || 0,
                  isDeleted: false,
                }
                setEducationList((prev) => [...prev, newEdu])
              }
            }}
            onRemove={handleRemove(setEducationList, educationList)}
            customInputFields={[
              { name: 'degree', placeholder: 'Degree' },
              { name: 'year', placeholder: 'Year', type: 'number' },
              { name: 'university', placeholder: 'University' },
            ]}
            addButtonLabel="Add"
            error={educationError}
            renderItem={(edu, onRemoveClick) => (
              <CButton
                color="secondary"
                className="me-2 mb-2"
                shape="rounded-pill"
                key={edu._id || edu._actualIndex}
                onClick={onRemoveClick}
              >
                {edu.name} ({edu.completionYear})
                <CIcon icon={cilX} className="ms-1" />
              </CButton>
            )}
          />

          {/* Renowned Cases */}
          <ListSection
            title="Renowned Cases"
            items={cases}
            onAdd={(val) => {
              if (val.caseTitle && val.caseYear && val.court && val.link) {
                const newCase = {
                  caseTitle: val.caseTitle,
                  caseYear: Number(val.caseYear),
                  courtLicense: val.court,
                  caseLink: val.link,
                  isDeleted: false,
                }
                setCases((prev) => [...prev, newCase])
              }
            }}
            onRemove={handleRemove(setCases, cases)}
            customInputFields={[
              { name: 'caseTitle', placeholder: 'Case Title' },
              { name: 'caseYear', placeholder: 'Year', type: 'number' },
              { name: 'court', placeholder: 'Court' },
              { name: 'link', placeholder: 'Link' },
            ]}
            addButtonLabel="Add"
            renderItem={(c, onRemoveClick) => (
              <CButton
                color="secondary"
                className="me-2 mb-2"
                shape="rounded-pill"
                key={c._id || c._actualIndex}
                onClick={onRemoveClick}
              >
                {c.caseTitle} ({c.caseYear}) - {c.courtLicense}
                <CIcon icon={cilX} className="ms-1" />
              </CButton>
            )}
          />

          {/* Certificates */}
          <CCard className="mb-4">
            <CCardHeader className="bg-warning text-white py-3">
              <h5 className="mb-0 fw-semibold" style={{ color: '#000' }}>
                Certificates
              </h5>
            </CCardHeader>
            <CCardBody>
              <div className="d-flex flex-wrap gap-3 mb-3">
                {certificateList
                  .map((cert, idx) => ({ ...cert, _actualIndex: idx }))
                  .filter((cert) => !cert.isDeleted)
                  .map((cert) => (
                    <div key={cert._id || cert._actualIndex} className="position-relative">
                      <CImage
                        src={cert.fileUrl || cert}
                        style={{ width: 150, height: 150, objectFit: 'cover' }}
                        className="rounded"
                      />
                      <CButton
                        color="secondary"
                        size="sm"
                        className="position-absolute top-0 end-0 m-1 rounded-circle"
                        style={{
                          width: '24px',
                          height: '24px',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(92, 88, 100, 0.33)',
                          border: 'none',
                        }}
                        onClick={() => handleRemoveCertificate(cert._actualIndex)}
                      >
                        <CIcon icon={cilX} size="sm" />
                      </CButton>
                    </div>
                  ))}
              </div>
              <div className="d-flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        handleAddCertificate(reader.result)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  style={{ display: 'none' }}
                  id="certificate-input"
                />
                <CButton
                  color="warning"
                  onClick={() => document.getElementById('certificate-input').click()}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Upload Certificate
                </CButton>
              </div>
            </CCardBody>
          </CCard>

          <div className="text-end mt-4 mb-4">
            <CButton color="warning" onClick={handleSave} disabled={isSavingProfile}>
              {isSavingProfile ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </CButton>
          </div>

          {/* Locations Section */}
          <CCard className="mb-4">
            <CCardHeader className="bg-light">
              <h5 className="mb-0">Locations</h5>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>City</CFormLabel>
                  <CFormSelect
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    options={cityOptions}
                  />
                </CCol>
              </CRow>

              {/* Render locations from array */}
              {locations.map((loc) => (
                <div key={loc.location_id} className="mb-4">
                  <h6>
                    {loc.type === 'Office'
                      ? 'Personal Office Location'
                      : loc.type === 'Chamber'
                        ? 'Chamber Location'
                        : loc.type === 'Home'
                          ? 'Home Location'
                          : loc.type === 'Online'
                            ? 'Online Location'
                            : loc.type}
                  </h6>
                  <CFormLabel>Area</CFormLabel>
                  <CFormInput
                    value={loc.area || ''}
                    onChange={(e) => handleLocationChange(loc.location_id, 'area', e.target.value)}
                    placeholder="e.g. Johar Town"
                    className="mb-2"
                  />
                  <CFormLabel>Address</CFormLabel>
                  <CFormInput
                    value={loc.address || ''}
                    onChange={(e) =>
                      handleLocationChange(loc.location_id, 'address', e.target.value)
                    }
                    placeholder="123 Maple Street, Springfield, IL 62704"
                    className="mb-2"
                  />
                  <CFormLabel>Directional Note</CFormLabel>
                  <CFormTextarea
                    rows={2}
                    placeholder="Head east on Maple Avenue, take a left..."
                    value={loc.directionNotes || ''}
                    onChange={(e) =>
                      handleLocationChange(loc.location_id, 'directionNotes', e.target.value)
                    }
                  />
                </div>
              ))}
            </CCardBody>
          </CCard>

          {/* Fees Section */}
          <CCard>
            <CCardHeader className="bg-white border-bottom">
              <h5 className="mb-0">Fees</h5>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3 d-flex flex-column justify-content-between">
                {Object.entries(FEE_TYPES).map(([key, label]) => {
                  const feeKey = key.toLowerCase()
                  return (
                    <CCol md={6} key={key}>
                      <div className="d-flex align-items-baseline">
                        <CFormLabel
                          className="me-3 mb-0"
                          style={{ whiteSpace: 'nowrap', minWidth: '200px' }}
                        >
                          {label} Fee
                        </CFormLabel>
                        <CFormInput
                          type="number"
                          min="1"
                          placeholder={`${label} Fee`}
                          value={fees[feeKey]}
                          onChange={(e) => handleFeeChange(feeKey, e.target.value)}
                        />
                      </div>
                    </CCol>
                  )
                })}
              </CRow>
            </CCardBody>
          </CCard>

          <div className="text-end mt-4">
            <CButton
              color="warning"
              onClick={handleSaveLocationsAndFees}
              disabled={isSavingLocations}
            >
              {isSavingLocations ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Saving...
                </>
              ) : (
                'Save Locations & Fees'
              )}
            </CButton>
          </div>

          {/* Footer Buttons */}
          <div className="d-flex justify-content-end mt-2 mb-4 ml-2">
            <CButton color="secondary" variant="outline" className="me-2">
              Edit Profile
            </CButton>
            <CButton
              color="success"
              className="me-2"
              onClick={() => navigate('/profile/view-availability', { state: { id } })}
            >
              View Availability
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default EditProfile
