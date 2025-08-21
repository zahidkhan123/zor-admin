import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAvatar,
  CPagination,
  CPaginationItem,
  CDropdown,
  CButton,
  CSpinner,
  CToaster,
  CToast,
  CToastBody,
  CToastClose,
  CNav,
  CNavItem,
  CNavLink,
  CWidgetStatsC,
  CFormInput,
  CFormSelect,
} from '@coreui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilUserFollow, cilPlus, cilSearch } from '@coreui/icons'
import { useGetLawyersQuery } from '../../../services/api'
import { FaCheckCircle } from 'react-icons/fa'

const tabs = [
  { key: 'pending', label: 'New Registrations' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const cities = ['Lahore', 'Karachi', 'Islamabad', 'Gujranwala', 'Sialkot', 'Rawalpindi']

const PAGE_SIZE = 10 // Changed to match backend default

const Registration = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { modified } = location.state || {}
  const [activeTab, setActiveTab] = useState('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [citySearchTerm, setCitySearchTerm] = useState('')
  const [debouncedCitySearchTerm, setDebouncedCitySearchTerm] = useState('')

  const handleCitySearchChange = (e) => {
    setCitySearchTerm(e.target.value)
  }

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => {
      clearTimeout(timerId)
    }
  }, [searchTerm])

  // Debounce city search term to avoid too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedCitySearchTerm(citySearchTerm)
    }, 500)

    return () => {
      clearTimeout(timerId)
    }
  }, [citySearchTerm])

  const { data, error, isLoading, refetch } = useGetLawyersQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    type: activeTab,
    search: debouncedSearchTerm,
    city: debouncedCitySearchTerm || undefined,
  })

  const paginatedLawyers = data?.data?.lawyers || []
  const totalPages = data?.data?.pagination?.totalPages || 1

  useEffect(() => {
    if (location?.state?.tab) {
      setActiveTab(location.state.tab)
    }
    if (location?.state?.page) {
      setCurrentPage(location.state.page)
    }
    if (location?.state?.tab || location?.state?.page) {
      window.history.replaceState({}, document.title)
    }
  }, [location?.state])

  useEffect(() => {
    if (location?.state?.lawyerAdded) {
      setToastMessage('Lawyer registered successfully!')
      setToastVisible(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  useEffect(() => {
    if (modified) {
      refetch()
      setToastMessage('Lawyer updated successfully!')
      setToastVisible(true)
      window.history.replaceState({}, document.title)
    }
  }, [modified, activeTab])

  const handleSearchChange = (e) => {
    console.log(e.target.value)
    setSearchTerm(e.target.value)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const renderPaginationItems = () => {
    const items = []

    if (totalPages === 0) return items

    items.push(
      <CPaginationItem key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>
        1
      </CPaginationItem>,
    )

    if (currentPage > 3) {
      items.push(
        <CPaginationItem key="ellipsis1" disabled>
          ...
        </CPaginationItem>,
      )
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(
        <CPaginationItem key={i} active={currentPage === i} onClick={() => handlePageChange(i)}>
          {i}
        </CPaginationItem>,
      )
    }

    if (currentPage < totalPages - 2) {
      items.push(
        <CPaginationItem key="ellipsis2" disabled>
          ...
        </CPaginationItem>,
      )
    }

    if (totalPages > 1) {
      items.push(
        <CPaginationItem
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </CPaginationItem>,
      )
    }

    return items
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <CSpinner color="warning" style={{ width: '4rem', height: '4rem' }} variant="grow" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-danger">
          <CIcon icon={cilPeople} height={36} className="mb-2" />
          <h4>Error fetching lawyers</h4>
        </div>
      </div>
    )
  }

  const { summary = {} } = data?.data || {}

  return (
    <>
      <CToaster placement="top-end" className="mt-4">
        {toastVisible && (
          <CToast
            autohide={true}
            color="success"
            className="border-0 shadow-lg"
            visible={true}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: '#fff',
              borderRadius: '0.75rem',
              minWidth: '320px',
            }}
          >
            <div className="d-flex align-items-center">
              <FaCheckCircle size={24} className="me-3" />
              <CToastBody className="fw-semibold flex-grow-1">{toastMessage}</CToastBody>
              <CToastClose className="ms-3 m-auto" style={{ color: '#fff', opacity: 0.8 }} />
            </div>
          </CToast>
        )}
      </CToaster>

      <CCard className="mb-4 p-3">
        <CRow className="justify-content-center">
          <CCol xs={12} sm={6} lg={6} xxl={6} className="mb-4">
            <CWidgetStatsC
              icon={<CIcon icon={cilPeople} height={36} />}
              value={summary?.total_lawyers?.toString()}
              title={`Total ${tabs.find((t) => t.key === activeTab)?.label}`}
              progress={{ color: 'warning', value: 75 }}
            />
          </CCol>
          <CCol xs={12} sm={6} lg={6} xxl={6} className="mb-4">
            <CWidgetStatsC
              icon={<CIcon icon={cilUserFollow} height={36} />}
              value={summary?.new_lawyers_this_month?.toString()}
              title={`New ${tabs.find((t) => t.key === activeTab)?.label} (This Month)`}
              progress={{ color: 'warning', value: 75 }}
            />
          </CCol>
        </CRow>
      </CCard>

      <CCardBody>
        <CRow
          className="align-items-center justify-content-between mb-3"
          style={{ marginRight: 0 }}
        >
          {/* Add New Lawyer Button */}
          <CCol xs="auto" className="p-3">
            <CButton
              color="warning"
              onClick={() => navigate('/lawyers/add', { state: { mode: 'add' } })}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Add New Lawyer
            </CButton>
          </CCol>

          {/* Search Fields */}
          <CCol xs="auto" className="d-flex align-items-center p-0">
            {/* City Search */}
            <div className="position-relative me-2">
              <CIcon
                icon={cilSearch}
                className="position-absolute"
                style={{ top: '14px', left: '12px', zIndex: 10 }}
              />
              <CFormInput
                type="text"
                placeholder="Search by city..."
                value={citySearchTerm}
                onChange={handleCitySearchChange}
                className="ps-5"
                style={{
                  width: '250px', // Reduced width for compactness
                  fontSize: '1rem',
                  height: '44px',
                  borderRadius: '6px',
                }}
              />
            </div>

            {/* Name / Phone / Email Search */}
            <div className="position-relative">
              <CIcon
                icon={cilSearch}
                className="position-absolute"
                style={{ top: '14px', left: '12px', zIndex: 10 }}
              />
              <CFormInput
                type="text"
                placeholder="Search by name, phone or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="ps-5"
                style={{
                  width: '280px', // Slightly wider for long text
                  fontSize: '1rem',
                  height: '44px',
                  borderRadius: '6px',
                }}
              />
            </div>
          </CCol>
        </CRow>
      </CCardBody>

      <CCard className="mb-4">
        <CNav variant="tabs" className="mb-4">
          {tabs.map((tab, idx) => (
            <CNavItem key={idx}>
              <CNavLink
                active={activeTab === tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setCurrentPage(1)
                }}
              >
                {tab.label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>

        <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead className="text-nowrap">
            <CTableRow>
              <CTableHeaderCell className="bg-body-tertiary text-center">ID</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-center">Lawyer</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-center">Phone</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-center">Email</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-center">
                Age & Gender
              </CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-center">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {paginatedLawyers.length > 0 ? (
              paginatedLawyers.map((lawyer) => (
                <CTableRow
                  key={lawyer._id}
                  onClick={() =>
                    navigate(`/registration/view/${lawyer._id}`, {
                      state: {
                        lawyer,
                        fromTab: activeTab,
                        fromPage: currentPage,
                        from: 'registrations',
                      },
                    })
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <CTableDataCell className="text-center">
                    {lawyer?._id?.slice(-5)?.toUpperCase()}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <div className="d-flex align-items-center justify-content-center">
                      <CAvatar size="md" src={lawyer?.image} />
                      <div className="ms-2 text-start" style={{ minWidth: '120px' }}>
                        {lawyer?.name}
                      </div>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">{lawyer?.phone}</CTableDataCell>
                  <CTableDataCell className="text-center">{lawyer?.email}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    {`${lawyer?.age || 'N/A'} / ${lawyer?.gender || 'N/A'}`}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CDropdown alignment="end">
                      <span style={{ fontSize: '24px', cursor: 'pointer' }}>⋮</span>
                    </CDropdown>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={6} className="text-center py-4">
                  {debouncedSearchTerm ? 'No matching lawyers found.' : 'No lawyers found.'}
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>

        {paginatedLawyers.length > 0 && totalPages > 1 && (
          <CPagination align="end" className="mt-3 me-3">
            <CPaginationItem
              aria-label="Previous"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              &laquo;
            </CPaginationItem>
            {renderPaginationItems()}
            <CPaginationItem
              aria-label="Next"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              &raquo;
            </CPaginationItem>
          </CPagination>
        )}
      </CCard>
    </>
  )
}

export default Registration
