import React, { useState } from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CAvatar,
  CButton,
  CFormInput,
  CFormSelect,
  CCardHeader,
  CImage,
} from '@coreui/react'
import { cilMap, cilPencil, cilPlus, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useGetCategoriesQuery } from '../../../services/api.js'
const ListSection = ({ title, placeholder, items, onAdd, onRemove }) => {
  const [input, setInput] = useState('')

  return (
    <CCard className="mb-4">
      <CCardHeader className="bg-warning text-white">
        <h5 className="mb-0">{title}</h5>
      </CCardHeader>
      <CCardBody>
        <div className="d-flex gap-2 mb-3">
          <CFormInput
            placeholder={placeholder}
            className="flex-grow-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <CButton
            color="warning"
            size="sm"
            className="d-flex align-items-center gap-1 px-3"
            onClick={() => {
              if (input.trim()) {
                onAdd(input.trim())
                setInput('')
              }
            }}
          >
            <CIcon icon={cilPlus} />
            <span>Add</span>
          </CButton>
        </div>
        <div className="d-flex flex-wrap">
          {items.map((item, index) => (
            <CButton
              color="secondary"
              className="me-2 mb-2"
              shape="rounded-pill"
              key={index}
              onClick={() => onRemove(index)}
            >
              {item}
              <CIcon icon={cilX} className="ms-1" />
            </CButton>
          ))}
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

const ProfileDetail = () => {
  const address = '1276 Fifth Ave Ste 704 PMB 170, New York, NY 10001'
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Select Category')

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

  const handleAdd = (setFunc, list) => (val) => setFunc([...list, val])
  const handleRemove = (setFunc, list) => (index) => setFunc(list.filter((_, i) => i !== index))

  const handleAddEducation = () => {
    if (degree && year && university) {
      const newEdu = `${degree}, ${year}, ${university}`
      setEducationList([...educationList, newEdu])
      setDegree('')
      setYear('')
      setUniversity('')
    }
  }

  const handleRemoveEducation = (index) => {
    setEducationList(educationList.filter((_, i) => i !== index))
  }

  const handleAddCase = () => {
    if (caseTitle && caseYear && court && link) {
      const newCase = `${caseTitle}, ${caseYear}, ${court}, ${link}`
      setCases([...cases, newCase])
    }
  }

  const handleRemoveCase = (index) => {
    setCases(cases.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const payload = {
      name,
      category,
      specializations,
      services,
      experience,
      cases,
      languages,
      memberships,
      educationList,
    }
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
            <CCol xs={12} md="auto" className="text-center mb-4 mb-md-0">
              <CAvatar
                src="https://picsum.photos/300"
                style={{ width: '150px', height: '150px' }}
                className="border shadow"
              />
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
                  <CButton
                    color="secondary"
                    size="sm"
                    className="position-absolute top-0 end-0 mt-1 me-1"
                  >
                    <CIcon icon={cilPencil} />
                  </CButton>
                </CCol>
                <CCol md={6}>
                  <CFormSelect
                    options={['Select Category', 'Criminal Defense', 'Taxation']}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </CCol>
              </CRow>
            </CCol>
          </CRow>

          {/* Locations */}
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

          {/* Dynamic Sections */}
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

          {/* Education Section */}
          <CCard className="mb-4">
            <CCardHeader className="bg-warning text-white">
              <h5 className="mb-0">Education</h5>
            </CCardHeader>
            <CCardBody>
              <div className="d-flex gap-2 mb-3">
                <CFormInput
                  type="text"
                  placeholder="Degree"
                  className="flex-grow-1"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
                <CFormInput
                  type="text"
                  placeholder="Year"
                  className="flex-grow-1"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
                <CFormInput
                  type="text"
                  placeholder="University"
                  className="flex-grow-1"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-end mb-3">
                <CButton color="warning" className="text-black" onClick={handleAddEducation}>
                  + Add
                </CButton>
              </div>
              <div className="d-flex flex-wrap">
                {educationList.map((edu, index) => (
                  <CButton
                    key={index}
                    color="secondary"
                    className="me-2 mb-2"
                    shape="rounded-pill"
                    onClick={() => handleRemoveEducation(index)}
                  >
                    {edu}
                    <CIcon icon={cilX} className="ms-1" />
                  </CButton>
                ))}
              </div>
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader className="bg-warning text-white">
              <h5 className="mb-0">Renounced Cases</h5>
            </CCardHeader>
            <CCardBody>
              <div className="d-flex gap-2 mb-3">
                <CFormInput
                  type="text"
                  placeholder="Case Title"
                  className="flex-grow-1"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                />
                <CFormInput
                  type="text"
                  placeholder="Case Year"
                  className="flex-grow-1"
                  value={caseYear}
                  onChange={(e) => setCaseYear(e.target.value)}
                />
                <CFormInput
                  type="text"
                  placeholder="Court"
                  className="flex-grow-1"
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                />
                <CFormInput
                  type="text"
                  placeholder="Link"
                  className="flex-grow-1"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-end mb-3">
                <CButton color="warning" className="text-black" onClick={handleAddCase}>
                  + Add
                </CButton>
              </div>
              <div className="d-flex flex-wrap">
                {cases.map((caseItem, index) => (
                  <CButton
                    key={index}
                    color="secondary"
                    className="me-2 mb-2"
                    shape="rounded-pill"
                    onClick={() => handleRemoveCase(index)}
                  >
                    {caseItem}
                    <CIcon icon={cilX} className="ms-1" />
                  </CButton>
                ))}
              </div>
            </CCardBody>
          </CCard>

          {/* Certifications */}
          <CCard>
            <CCardHeader className="bg-warning text-white">
              <h5 className="mb-0">Certifications</h5>
            </CCardHeader>
            <CCardBody>
              <CCol xs={12} md={8} className="d-flex flex-wrap gap-3">
                {[...Array(3)].map((_, idx) => (
                  <CImage
                    key={idx}
                    src="https://picsum.photos/200"
                    thumbnail
                    width={120}
                    height={80}
                  />
                ))}
              </CCol>
            </CCardBody>
          </CCard>
        </CCardBody>

        {/* Footer Buttons */}
        <div className="d-flex justify-content-end mt-2 mb-4 ml-2">
          <CButton color="secondary" variant="outline" className="me-2">
            Cancel
          </CButton>
          <CButton color="success" className="me-2" onClick={handleSave}>
            Save
          </CButton>
        </div>
      </CCard>
    </CContainer>
  )
}

export default ProfileDetail
