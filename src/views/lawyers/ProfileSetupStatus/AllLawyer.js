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
  CBadge,
} from '@coreui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilUserFollow, cilPlus, cilSearch } from '@coreui/icons'
import { useGetLawyersProfileSetupQuery } from '../../../services/api'
import { FaCheckCircle } from 'react-icons/fa'

const tabs = [
  { key: 'new', label: 'New' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
]

const PAGE_SIZE = 10 // Changed to match backend default

const ProfileSetup = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { modified } = location.state || {}
  const [activeTab, setActiveTab] = useState('new')
  const [currentPage, setCurrentPage] = useState(1)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [citySearchTerm, setCitySearchTerm] = useState('')
  const [debouncedCitySearchTerm, setDebouncedCitySearchTerm] = useState('')

  // New: Track if we are loading due to pagination or tab change
  const [tableLoading, setTableLoading] = useState(false)
  // Track last query params to detect when loading is due to pagination/tab/search/city
  const [lastQuery, setLastQuery] = useState({
    page: 1,
    status: 'new',
    search: '',
    city: '',
  })

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

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedCitySearchTerm(citySearchTerm)
    }, 500)

    return () => {
      clearTimeout(timerId)
    }
  }, [citySearchTerm])

  // Detect if we are loading due to pagination, tab, search, or city change
  useEffect(() => {
    // Only set tableLoading to true if any of the query params change
    if (
      lastQuery.page !== currentPage ||
      lastQuery.status !== activeTab ||
      lastQuery.search !== debouncedSearchTerm ||
      lastQuery.city !== debouncedCitySearchTerm
    ) {
      setLastQuery({
        page: currentPage,
        status: activeTab,
        search: debouncedSearchTerm,
        city: debouncedCitySearchTerm,
      })
    }
  }, [currentPage, activeTab, debouncedSearchTerm, debouncedCitySearchTerm]) // eslint-disable-line

  const { data, error, isLoading, refetch, isFetching } = useGetLawyersProfileSetupQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    status: activeTab,
    search: debouncedSearchTerm,
    city: debouncedCitySearchTerm || undefined,
  })

  // When fetching is done, hide the table loader
  useEffect(() => {
    if (!isFetching) {
      setTableLoading(false)
    }
  }, [isFetching])

  const paginatedLawyers = data?.data?.lawyers || []
  // Fix: Make sure totalPages is at least 1 if there are lawyers, otherwise 0
  const totalPages =
    data?.data?.pagination?.totalPages !== undefined
      ? data.data.pagination.totalPages
      : paginatedLawyers.length > 0
        ? 1
        : 0

  useEffect(() => {
    if (location?.state?.tab) {
      setActiveTab(location.state.tab)
      window.history.replaceState({}, document.title)
    }
  }, [location?.state?.tab])

  useEffect(() => {
    if (location?.state?.lawyerAdded) {
      setToastMessage('Lawyer registered successfully!')
      setToastVisible(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  useEffect(() => {
    if (modified || location?.state?.tab) {
      refetch()
      setToastMessage('Lawyer updated successfully!')
      setToastVisible(true)
      window.history.replaceState({}, document.title)
    }
  }, [modified, location?.state?.tab, refetch])

  // Reset to page 1 when tab or search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, debouncedSearchTerm])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
    }
  }

  // Improved pagination rendering for all edge cases
  const renderPaginationItems = () => {
    const items = []
    if (totalPages <= 1) return items

    // Always show first page
    items.push(
      <CPaginationItem key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>
        1
      </CPaginationItem>,
    )

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <CPaginationItem key="ellipsis1" disabled>
          ...
        </CPaginationItem>,
      )
    }

    // Show pages around current page
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

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <CPaginationItem key="ellipsis2" disabled>
          ...
        </CPaginationItem>,
      )
    }

    // Always show last page if more than 1
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

  // Only show full page loader on first load
  if (isLoading && !tableLoading) {
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
        <CRow className="align-items-center mb-3">
          <CCol xs={12} md={4} className="mb-2">
            {/* <CButton
              color="warning"
              onClick={() => navigate('/lawyers/add', { state: { mode: 'add' } })}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Add New Lawyer
            </CButton> */}
          </CCol>
          <CCol xs={12} md={4} className="mb-2">
            <div className="position-relative" style={{ maxWidth: '600px' }}>
              <CIcon
                icon={cilSearch}
                className="position-absolute"
                style={{ top: '17px', left: '15px', zIndex: 10 }}
              />
              <CFormInput
                type="text"
                placeholder="Search by city..."
                value={citySearchTerm}
                onChange={handleCitySearchChange}
                className="ps-5"
                style={{ minWidth: '400px', fontSize: '1.1rem', height: '48px' }}
              />
            </div>
          </CCol>
          <CCol xs={12} md={4} className="mb-2">
            <div className="position-relative" style={{ maxWidth: '600px', float: 'right' }}>
              <CIcon
                icon={cilSearch}
                className="position-absolute"
                style={{ top: '17px', left: '15px', zIndex: 10 }}
              />
              <CFormInput
                type="text"
                placeholder="Search by name, phone or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="ps-5"
                style={{ minWidth: '400px', fontSize: '1.1rem', height: '48px' }}
              />
            </div>
          </CCol>
        </CRow>
      </CCardBody>

      <CCard className="mb-4">
        <CNav variant="tabs" className="mb-4">
          {tabs.map((tab, idx) => (
            <CNavItem key={idx}>
              <CNavLink active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>

        {/* Loader inside the tabs/table area when paginating or tab/search/city changes */}
        {isFetching ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '300px' }}
          >
            <CSpinner color="warning" style={{ width: '3rem', height: '3rem' }} variant="grow" />
          </div>
        ) : (
          <>
            <CTable align="middle" className="mb-0 border" hover responsive>
              <CTableHead className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="bg-body-tertiary text-center">ID</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-center">
                    Lawyer
                  </CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-center">
                    Phone
                  </CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-center">
                    Email
                  </CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-center">
                    Status
                  </CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-center">
                    Action
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {paginatedLawyers.length > 0 ? (
                  paginatedLawyers.map((lawyer) => (
                    <CTableRow
                      key={lawyer._id}
                      onClick={() => navigate(`/profile/edit/${lawyer._id}`, { state: { lawyer } })}
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
                        <CBadge
                          color={
                            lawyer.is_live === 'pending'
                              ? 'warning'
                              : lawyer.is_live === 'active'
                                ? 'success'
                                : lawyer.is_live === 'paused'
                                  ? 'danger'
                                  : lawyer.is_live === 'rejected'
                                    ? 'warning'
                                    : 'secondary'
                          }
                        >
                          {lawyer.is_live}
                        </CBadge>
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

            {/* Pagination: Only show if there are lawyers and more than 1 page */}
            {paginatedLawyers.length > 0 && totalPages > 1 && (
              <div className="d-flex justify-content-end mt-3 me-3">
                <CPagination>
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
              </div>
            )}
          </>
        )}
      </CCard>
    </>
  )
}

export default ProfileSetup
