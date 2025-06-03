import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'
import { cilMap, cilPencil, cilPlus, cilX, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useGetCategoriesQuery, useGetLawyerByIdQuery } from '../../../services/api.js'
import { useParams } from 'react-router-dom'
import { fetchSignedUrl, fetchMultipleSignedUrls } from '../../../assets/utils/imageUtils'

const ListSection = ({ title, placeholder, items, onAdd, onRemove }) => {
  const [input, setInput] = useState('')

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardHeader className="bg-warning text-white py-3">
        <h5 className="mb-0 fw-semibold">{title}</h5>
      </CCardHeader>
      <CCardBody className="p-4">
        <div className="d-flex gap-2 mb-4">
          <CFormInput
            placeholder={placeholder}
            className="flex-grow-1 border-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <CButton
            color="warning"
            size="sm"
            className="d-flex align-items-center gap-1 px-4 py-2 fw-semibold"
            onClick={() => {
              if (input.trim()) {
                onAdd(input.trim())
                setInput('')
              }
            }}
          >
            <CIcon icon={cilPlus} className="fs-5" />
            <span>Add</span>
          </CButton>
        </div>
        <div className="mb-3">
          <h6 className="text-muted mb-3">Selected Items:</h6>
          <div className="d-flex flex-wrap gap-2">
            {(items || [])
              .filter((item) => !item.isDeleted)
              .map((item, index) => (
                <CButton
                  color="secondary"
                  className="d-flex align-items-center px-3 py-2"
                  shape="rounded-pill"
                  key={index}
                  onClick={() => onRemove(index)}
                >
                  <span className="me-1">{typeof item === 'object' ? item.name : item}</span>
                  <CIcon icon={cilX} className="fs-6" />
                </CButton>
              ))}
          </div>
        </div>
      </CCardBody>
    </CCard>
  )
}

const renderLocationCard = (title, address) => (
  <CCard className="mb-4">
    <CCardHeader>
      <h6 className="mb-0">{title}</h6>
    </CCardHeader>
    <CCardBody className="d-flex justify-content-between align-items-center">
      <span className="text-secondary">{address}</span>
      <CButton color="secondary" size="sm">
        <CIcon icon={cilMap} className="me-1" />
        View on map
      </CButton>
    </CCardBody>
  </CCard>
)

const EditProfile = () => {
  const { id } = useParams()
  const { data: categoriesData } = useGetCategoriesQuery()
  const { data: lawyerData } = useGetLawyerByIdQuery(id, { skip: !id })

  const address = '1276 Fifth Ave Ste 704 PMB 170, New York, NY 10001'

  const [name, setName] = useState('')
  const [category, setCategory] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])

  const [specializations, setSpecializations] = useState([])
  const [services, setServices] = useState([])
  const [experience, setExperience] = useState([])
  const [cases, setCases] = useState([])
  const [languages, setLanguages] = useState([])
  const [memberships, setMemberships] = useState([])

  const [educationList, setEducationList] = useState([])
  const [degree, setDegree] = useState('')
  const [year, setYear] = useState('')
  const [university, setUniversity] = useState('')

  const [caseTitle, setCaseTitle] = useState('')
  const [caseYear, setCaseYear] = useState('')
  const [court, setCourt] = useState('')
  const [link, setLink] = useState('')

  const [homeOfficeFee, setHomeOfficeFee] = useState('')
  const [chamberOfficeFee, setChamberOfficeFee] = useState('')
  const [personalOfficeFee, setPersonalOfficeFee] = useState('')
  const [onlineFee, setOnlineFee] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [certificateList, setCertificateList] = useState([])

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

  // useEffect(() => {
  //   if (lawyerData?.data?.lawyer) {
  //     const l = lawyerData.data.lawyer
  //     setName(l.user.name || '')
  //     const categories = Array.isArray(l.categories) ? l.categories : []
  //     setCategory(categories.map((c) => c._id))
  //     setSelectedCategories(categories)
  //     setSpecializations(
  //       Array.isArray(l.specializations) ? l.specializations.map((s) => s.name) : [],
  //     )
  //     setServices(Array.isArray(l.services) ? l.services.map((s) => s.name) : [])
  //     setExperience(Array.isArray(l.experience) ? l.experience.map((e) => e.name) : [])
  //     setCases(
  //       l.renouncedCases?.map(
  //         (c) => `${c.caseTitle}, ${c.caseYear}, ${c.courtLicense}, ${c.caseLink}`,
  //       ) || [],
  //     )
  //     setLanguages(Array.isArray(l.languages) ? l.languages.map((l) => l.name) : [])
  //     setMemberships(Array.isArray(l.memberships) ? l.memberships.map((m) => m.name) : [])
  //     setEducationList(Array.isArray(l.education) ? l.education.map((e) => e.name) : [])
  //   }
  // }, [lawyerData])

  useEffect(() => {
    if (lawyerData?.data?.lawyer) {
      const l = lawyerData.data.lawyer

      setName(l.user.name || '')

      // Categories
      const categories = Array.isArray(l.categories) ? l.categories : []
      setCategory(categories.map((c) => c._id))
      setSelectedCategories(categories)

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
  }, [lawyerData])

  useEffect(() => {
    if (lawyerData?.data?.lawyer?.categories) {
      const preselected = lawyerData.data.lawyer.categories
      setCategory(preselected.map((cat) => cat._id))
      setSelectedCategories(preselected)
    }
  }, [lawyerData])

  const handleAdd = (setFunc, list) => (val) => {
    if (val && val.trim()) {
      const newItem = {
        name: val.trim(),
        isDeleted: false,
      }
      setFunc([...list, newItem])
    }
  }

  const handleRemove = (setFunc, list) => (index) => {
    const updated = [...list]
    if (updated[index]._id) {
      updated[index].isDeleted = true
    } else {
      updated.splice(index, 1)
    }
    setFunc(updated)
  }

  const handleAddEducation = () => {
    if (degree && year && university) {
      const newEdu = {
        name: `${degree}, ${university}`,
        completionYear: parseInt(year) || 0,
        isDeleted: false,
      }
      setEducationList([...educationList, newEdu])
      setDegree('')
      setYear('')
      setUniversity('')
    }
  }

  const handleRemoveEducation = (index) => {
    debugger
    const updated = [...educationList]
    debugger
    if (updated[index]._id) {
      debugger
      updated[index].isDeleted = true
      setEducationList(updated)
    } else {
      debugger
      updated.splice(index, 1)
      debugger
      setEducationList(updated)
    }
  }

  const handleAddCase = () => {
    if (caseTitle && caseYear && court && link) {
      const newCase = {
        caseTitle,
        caseYear: Number(caseYear),
        courtLicense: court,
        caseLink: link,
        isDeleted: false,
      }
      setCases([...cases, newCase])
      setCaseTitle('')
      setCaseYear('')
      setCourt('')
      setLink('')
    }
  }
  const handleRemoveCase = (index) => {
    debugger
    const updated = [...cases]
    if (updated[index]?._id) {
      debugger
      updated[index].isDeleted = true
    } else {
      debugger
      updated.splice(index, 1)
    }
    debugger
    setCases(updated)
  }

  const handleSave = () => {
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
      ...(selectedCategories?.length > 0 && {
        categories: selectedCategories.map((c) => ({
          _id: c?._id || '',
          name: c?.name || '',
          ...(c?.isDeleted !== undefined && { isDeleted: c.isDeleted }),
        })),
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
      ...(certificateList.length > 0 && {
        certificates: certificateList.map((fileUrl) => ({
          ...(fileUrl._id && { _id: fileUrl._id }),
          fileUrl,
          ...(fileUrl.isDeleted !== undefined && { isDeleted: fileUrl.isDeleted }),
        })),
      }),
    }
    debugger
    console.log('Saving Profile:', payload)
    alert('Profile saved! (see console for payload)')
  }
  return (
    <CContainer className="py-4">
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
                  <CDropdown className="mb-2">
                    <CDropdownToggle color="secondary">
                      {category.length > 0 ? `${category.length} selected` : 'Select Categories'}
                    </CDropdownToggle>
                    <CDropdownMenu style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {categoriesData?.data?.map((cat) => {
                        const isSelected = category.includes(cat._id)
                        return (
                          <div key={cat._id} className="px-3 py-1">
                            <CFormCheck
                              id={`cat-${cat._id}`}
                              label={cat.name}
                              value={cat._id}
                              checked={isSelected}
                              disabled={isSelected} // Disable if already selected
                              onChange={(e) => {
                                const selectedId = e.target.value
                                const selectedCat = categoriesData.data.find(
                                  (c) => c._id === selectedId,
                                )

                                if (e.target.checked && !isSelected) {
                                  setCategory((prev) => [...prev, selectedId, ...category])
                                  setSelectedCategories((prev) => [...prev, selectedCat])
                                }
                              }}
                            />
                          </div>
                        )
                      })}
                    </CDropdownMenu>
                  </CDropdown>

                  {/* Selected categories display */}
                  {selectedCategories.length > 0 && (
                    <div className="mt-2">
                      <h6 className="text-muted mb-2">Selected Categories:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedCategories.map((cat) => (
                          <CBadge color="warning" className="px-3 py-2 rounded-pill" key={cat._id}>
                            {cat.name}
                          </CBadge>
                        ))}
                      </div>
                    </div>
                  )}
                </CCol>
              </CRow>
            </CCol>
          </CRow>

          <CCard className="mb-4">
            <CCardHeader className="bg-warning text-white">
              <h5 className="mb-0">Locations</h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                {['Home Office', 'Chamber Office', 'Personal Office'].map((loc, index) => (
                  <CCol md={6} key={index}>
                    {renderLocationCard(loc, address)}
                  </CCol>
                ))}
              </CRow>
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader className="bg-warning text-white">
              <h5 className="mb-0">Fee</h5>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={3}>
                  <CFormInput
                    type="number"
                    min="1"
                    placeholder="Home Office Fee"
                    value={homeOfficeFee}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || parseInt(value) > 0) {
                        setHomeOfficeFee(value)
                      }
                    }}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    type="number"
                    min="1"
                    placeholder="Chamber Office Fee"
                    value={chamberOfficeFee}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || parseInt(value) > 0) {
                        setChamberOfficeFee(value)
                      }
                    }}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    type="number"
                    min="1"
                    placeholder="Personal Office Fee"
                    value={personalOfficeFee}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || parseInt(value) > 0) {
                        setPersonalOfficeFee(value)
                      }
                    }}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    type="number"
                    min="1"
                    placeholder="Online Fee"
                    value={onlineFee}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || parseInt(value) > 0) {
                        setOnlineFee(value)
                      }
                    }}
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <ListSection
            title="Specialization"
            placeholder="Add new specialization"
            items={specializations}
            onAdd={handleAdd(setSpecializations, specializations)}
            onRemove={handleRemove(setSpecializations, specializations)}
          />
          <ListSection
            title="Services"
            placeholder="Add new service"
            items={services}
            onAdd={handleAdd(setServices, services)}
            onRemove={handleRemove(setServices, services)}
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
          <CCard className="mb-4">
            <CCardHeader className="bg-warning text-white">
              <h5 className="mb-0">Education</h5>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3 g-2">
                <CCol>
                  <CFormInput
                    placeholder="Degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    placeholder="Year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    placeholder="University"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />
                </CCol>
                <CCol md="auto">
                  <CButton color="warning" onClick={handleAddEducation}>
                    <CIcon icon={cilPlus} /> Add
                  </CButton>
                </CCol>
              </CRow>
              <div className="d-flex flex-wrap">
                {educationList
                  .map((edu, actualIndex) => ({ ...edu, actualIndex }))
                  .filter((edu) => !edu.isDeleted)
                  .map((edu) => (
                    <CButton
                      color="secondary"
                      className="me-2 mb-2"
                      shape="rounded-pill"
                      key={edu?._id || edu.actualIndex}
                      onClick={() => handleRemoveEducation(edu.actualIndex)}
                    >
                      {edu.name} ({edu.completionYear})
                      <CIcon icon={cilX} className="ms-1" />
                    </CButton>
                  ))}
              </div>
            </CCardBody>
          </CCard>

          {/* Cases */}
          <CCard className="mb-4">
            <CCardHeader className="bg-warning text-white">
              <h5 className="mb-0">Renowned Cases</h5>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3 g-2">
                <CCol>
                  <CFormInput
                    placeholder="Case Title"
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    placeholder="Year"
                    value={caseYear}
                    onChange={(e) => setCaseYear(e.target.value)}
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    placeholder="Court"
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    placeholder="Link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </CCol>
                <CCol md="auto">
                  <CButton color="warning" onClick={handleAddCase}>
                    <CIcon icon={cilPlus} /> Add
                  </CButton>
                </CCol>
              </CRow>
              <div className="d-flex flex-wrap">
                {cases
                  .map((c, actualIndex) => ({ ...c, actualIndex }))
                  .filter((c) => !c.isDeleted)
                  .map((c) => (
                    <CButton
                      color="secondary"
                      className="me-2 mb-2"
                      shape="rounded-pill"
                      key={c?._id || c.actualIndex}
                      onClick={() => handleRemoveCase(c.actualIndex)}
                    >
                      {c.caseTitle} ({c.caseYear}) - {c.courtLicense}
                      <CIcon icon={cilX} className="ms-1" />
                    </CButton>
                  ))}
              </div>
            </CCardBody>
          </CCard>

          {/* Certificates */}
          <CCard className="mb-4">
            <CCardHeader className="bg-warning text-white">
              <h5 className="mb-0">Certificates</h5>
            </CCardHeader>
            <CCardBody>
              <div className="d-flex flex-wrap gap-3 mb-3">
                {certificateList.map((cert, index) => (
                  <div key={index} className="position-relative">
                    <CImage
                      src={cert}
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
                      onClick={() => {
                        setCertificateList(certificateList.filter((_, i) => i !== index))
                      }}
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
                        setCertificateList([...certificateList, reader.result])
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

          <div className="text-end">
            <CButton color="warning" onClick={handleSave}>
              Save Profile
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default EditProfile
