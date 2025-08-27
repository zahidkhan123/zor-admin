import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAvatar,
  CPagination,
  CPaginationItem,
  CBadge,
  CSpinner,
  CFormInput,
} from '@coreui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaEye } from 'react-icons/fa'
import { cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  useGetPendingSubmissionsQuery,
  useGetVerificationQuery,
  useGetFlaggedLawyersQuery,
} from '../../../services/api'

// Custom hook for debouncing a value
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

const Tabs = ({ path }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { fromTab, fromPage } = location.state || {}

  const [activeKey, setActiveKey] = useState(fromTab || 1)
  const [queryParams, setQueryParams] = useState({
    page: fromPage || 1,
    limit: 10,
    search: '',
    city: '',
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [citySearchTerm, setCitySearchTerm] = useState('')

  // Loader for search
  const [searching, setSearching] = useState(false)
  // Track last search/city to avoid unnecessary loader
  const lastSearch = useRef({ search: '', city: '' })

  // Debounced values for searchTerm and citySearchTerm
  const debouncedSearchTerm = useDebounce(searchTerm, 400)
  const debouncedCitySearchTerm = useDebounce(citySearchTerm, 400)

  useEffect(() => {
    if (fromTab) setActiveKey(fromTab)
    if (fromPage) setQueryParams((prev) => ({ ...prev, page: fromPage }))
  }, [navigate, fromTab, fromPage])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCitySearchChange = (e) => {
    setCitySearchTerm(e.target.value)
  }

  // Update queryParams when debounced search values change
  // Show loader when searching
  useEffect(() => {
    // Only set searching loader if search/city actually changed
    if (
      debouncedSearchTerm.trim() !== lastSearch.current.search ||
      debouncedCitySearchTerm.trim() !== lastSearch.current.city
    ) {
      setSearching(true)
      setQueryParams((prev) => ({
        ...prev,
        search: debouncedSearchTerm.trim(),
        city: debouncedCitySearchTerm.trim(),
        page: 1, // Always reset to first page when search/city changes
      }))
      lastSearch.current = {
        search: debouncedSearchTerm.trim(),
        city: debouncedCitySearchTerm.trim(),
      }
    }
    // eslint-disable-next-line
  }, [debouncedSearchTerm, debouncedCitySearchTerm])

  const {
    data: pendingData,
    isLoading: loadingPending,
    refetch: refetchPending,
  } = useGetPendingSubmissionsQuery({ ...queryParams, refreshTrigger }, { skip: activeKey !== 1 })

  const {
    data: pendingVerification,
    isLoading: loadingVerification,
    refetch: refetchVerification,
  } = useGetVerificationQuery(
    { ...queryParams, status: 'Pending', refreshTrigger },
    { skip: activeKey !== 2 },
  )

  const {
    data: rejectedVerification,
    isLoading: loadingRejected,
    refetch: refetchRejected,
  } = useGetVerificationQuery(
    { ...queryParams, status: 'Rejected', refreshTrigger },
    { skip: activeKey !== 3 },
  )

  const {
    data: verifiedVerification,
    isLoading: loadingVerifiedVerification,
    refetch: refetchVerifiedVerification,
  } = useGetVerificationQuery(
    { ...queryParams, status: 'Verified', refreshTrigger },
    { skip: activeKey !== 4 },
  )

  const {
    data: oldVerification,
    isLoading: loadingOldVerification,
    refetch: refetchOldVerification,
  } = useGetVerificationQuery(
    { ...queryParams, status: 'Re-Submitted', refreshTrigger },
    { skip: activeKey !== 5 },
  )

  const {
    data: spamVerification,
    isLoading: loadingSpamVerification,
    refetch: refetchSpamVerification,
  } = useGetFlaggedLawyersQuery({ ...queryParams, refreshTrigger }, { skip: activeKey !== 6 })

  useEffect(() => {
    const { refresh, fromTab } = location.state || {}
    if (refresh) {
      setRefreshTrigger((prev) => prev + 1)
      navigate(location.pathname, { replace: true, state: {} })

      const refetchFunctions = {
        1: refetchPending,
        2: refetchVerification,
        3: refetchRejected,
        4: refetchVerifiedVerification,
        5: refetchOldVerification,
        6: refetchSpamVerification,
      }
      refetchFunctions[fromTab || activeKey]?.()
    }
  }, [location.state, navigate, location.pathname])

  // When data for the current tab is loaded, stop searching loader
  useEffect(() => {
    // Only stop searching if not loading and search/city in queryParams matches lastSearch
    const isAnyLoading =
      loadingPending ||
      loadingVerification ||
      loadingRejected ||
      loadingVerifiedVerification ||
      loadingOldVerification ||
      loadingSpamVerification

    if (
      !isAnyLoading &&
      queryParams.search === lastSearch.current.search &&
      queryParams.city === lastSearch.current.city
    ) {
      setSearching(false)
    }
  }, [
    loadingPending,
    loadingVerification,
    loadingRejected,
    loadingVerifiedVerification,
    loadingOldVerification,
    loadingSpamVerification,
    queryParams.search,
    queryParams.city,
  ])

  const isLoading =
    (activeKey === 1 && loadingPending) ||
    (activeKey === 2 && loadingVerification) ||
    (activeKey === 3 && loadingRejected) ||
    (activeKey === 4 && loadingVerifiedVerification) ||
    (activeKey === 5 && loadingOldVerification) ||
    (activeKey === 6 && loadingSpamVerification) ||
    searching // Show loader when searching

  const tableData =
    activeKey === 1
      ? pendingData?.data?.results || []
      : activeKey === 2
        ? pendingVerification?.data?.results || []
        : activeKey === 3
          ? rejectedVerification?.data?.results || []
          : activeKey === 4
            ? verifiedVerification?.data?.results || []
            : activeKey === 5
              ? oldVerification?.data?.results || []
              : spamVerification?.data?.results || []

  // Reset page to 1 when activeKey changes (tab changes)
  useEffect(() => {
    setQueryParams((prev) => ({ ...prev, page: 1 }))
  }, [activeKey])

  console.log('pendingData?.data?.totalPages', pendingData?.data?.totalPages)
  console.log('pendingVerification?.data?.totalPages', pendingVerification?.data?.totalPages)
  console.log('rejectedVerification?.data?.totalPages', rejectedVerification?.data?.totalPages)
  console.log('verifiedVerification?.data?.totalPages', verifiedVerification?.data?.totalPages)
  console.log('oldVerification?.data?.totalPages', oldVerification?.data?.totalPages)
  console.log('spamVerification?.data?.totalPages', spamVerification?.data?.totalPages)

  // getTotalPages should always use the latest data for the current tab
  const getTotalPages = () => {
    switch (activeKey) {
      case 1:
        return pendingData?.data?.totalPages || 0
      case 2:
        return pendingVerification?.data?.totalPages || 0
      case 3:
        return rejectedVerification?.data?.totalPages || 0
      case 4:
        return verifiedVerification?.data?.totalPages || 0
      case 5:
        return oldVerification?.data?.totalPages || 0
      case 6:
        return spamVerification?.data?.totalPages || 0
      default:
        return 0
    }
  }

  // When search/city changes, page is reset to 1, so pagination always starts at 1
  // Fix: If current page > totalPages (e.g. after search), reset to last page
  useEffect(() => {
    const totalPages = getTotalPages()
    if (queryParams.page > totalPages && totalPages > 0) {
      setQueryParams((prev) => ({ ...prev, page: totalPages }))
    }
    // eslint-disable-next-line
  }, [tableData, activeKey])

  const renderPaginationItems = () => {
    const totalPages = getTotalPages()
    const currentPage = queryParams.page
    const items = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <CPaginationItem
            key={i}
            active={currentPage === i}
            onClick={() => setQueryParams((prev) => ({ ...prev, page: i }))}
          >
            {i}
          </CPaginationItem>,
        )
      }
    } else {
      items.push(
        <CPaginationItem
          key={1}
          active={currentPage === 1}
          onClick={() => setQueryParams((prev) => ({ ...prev, page: 1 }))}
        >
          1
        </CPaginationItem>,
      )

      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          items.push(
            <CPaginationItem
              key={i}
              active={currentPage === i}
              onClick={() => setQueryParams((prev) => ({ ...prev, page: i }))}
            >
              {i}
            </CPaginationItem>,
          )
        }
        items.push(
          <CPaginationItem key="ellipsis1" disabled>
            ...
          </CPaginationItem>,
        )
        items.push(
          <CPaginationItem
            key={totalPages}
            active={currentPage === totalPages}
            onClick={() => setQueryParams((prev) => ({ ...prev, page: totalPages }))}
          >
            {totalPages}
          </CPaginationItem>,
        )
      } else if (currentPage >= totalPages - 3) {
        items.push(
          <CPaginationItem key="ellipsis1" disabled>
            ...
          </CPaginationItem>,
        )
        for (let i = totalPages - 4; i <= totalPages; i++) {
          items.push(
            <CPaginationItem
              key={i}
              active={currentPage === i}
              onClick={() => setQueryParams((prev) => ({ ...prev, page: i }))}
            >
              {i}
            </CPaginationItem>,
          )
        }
      } else {
        items.push(
          <CPaginationItem key="ellipsis1" disabled>
            ...
          </CPaginationItem>,
        )
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push(
            <CPaginationItem
              key={i}
              active={currentPage === i}
              onClick={() => setQueryParams((prev) => ({ ...prev, page: i }))}
            >
              {i}
            </CPaginationItem>,
          )
        }
        items.push(
          <CPaginationItem key="ellipsis2" disabled>
            ...
          </CPaginationItem>,
        )
        items.push(
          <CPaginationItem
            key={totalPages}
            active={currentPage === totalPages}
            onClick={() => setQueryParams((prev) => ({ ...prev, page: totalPages }))}
          >
            {totalPages}
          </CPaginationItem>,
        )
      }
    }

    return items
  }

  const renderNoData = () => (
    <CTableRow>
      <CTableDataCell colSpan="7" className="text-center py-4">
        <div className="d-flex flex-column align-items-center">
          <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No Data Found</h5>
          <p className="text-muted mb-0">There are no records to display in this section.</p>
        </div>
      </CTableDataCell>
    </CTableRow>
  )

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <CSpinner color="warning" style={{ width: '4rem', height: '4rem' }} variant="grow" />
      </div>
    )
  }

  return (
    <>
      {/* Tabs and Search Row */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3 mt-3">
        <CNav variant="tabs" className="flex-wrap">
          {[
            'New Verifications',
            'Pending',
            'Rejected',
            'Verified',
            'Old Verifications',
            'Spam',
          ].map((label, idx) => (
            <CNavItem key={idx}>
              <CNavLink
                active={activeKey === idx + 1}
                onClick={() => setActiveKey(idx + 1)}
                style={{ cursor: 'pointer', fontSize: '1rem', padding: '0.6rem 1rem' }}
              >
                {label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>
        <div className="d-flex align-items-center">
          {/* City Search */}
          <div className="position-relative me-2" style={{ width: '250px' }}>
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
                fontSize: '1rem',
                height: '44px',
                borderRadius: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              }}
            />
            {searching && (
              <CSpinner
                color="warning"
                size="sm"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '14px',
                  zIndex: 11,
                  width: '1.2rem',
                  height: '1.2rem',
                }}
              />
            )}
          </div>

          {/* Name / Phone / Email Search */}
          <div className="position-relative" style={{ width: '280px' }}>
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
                fontSize: '1rem',
                height: '44px',
                borderRadius: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              }}
            />
            {searching && (
              <CSpinner
                color="warning"
                size="sm"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '14px',
                  zIndex: 11,
                  width: '1.2rem',
                  height: '1.2rem',
                }}
              />
            )}
          </div>
        </div>
      </div>

      <CTabContent>
        <CTabPane visible={true}>
          <CCard className="mb-4">
            <CTable align="middle" className="mb-0 border" hover responsive>
              <CTableHead className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="text-center">ID</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Lawyer</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Phone</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Email</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">City</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Gender/Age</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {tableData.length > 0
                  ? tableData.map((item, index) => (
                      <CTableRow
                        key={index}
                        onClick={() =>
                          activeKey === 1
                            ? navigate(`/registration/view/${item._id}`, {
                                state: {
                                  lawyer: item,
                                  fromTab: activeKey,
                                  fromPage: queryParams.page,
                                  searchTerm: searchTerm,
                                  from: 'verification',
                                },
                              })
                            : navigate(`${path}/${item.lawyer_id}`, {
                                state: {
                                  fromTab: activeKey,
                                  fromPage: queryParams.page,
                                  searchTerm: searchTerm,
                                },
                              })
                        }
                      >
                        {/* ID */}
                        <CTableDataCell
                          className="text-center align-middle"
                          style={{ verticalAlign: 'middle', padding: '12px 8px' }}
                        >
                          {index + 1}
                        </CTableDataCell>
                        {/* Lawyer */}
                        <CTableDataCell
                          className="text-center align-middle"
                          style={{ verticalAlign: 'middle', padding: '12px 8px' }}
                        >
                          <div className="d-flex align-items-center justify-content-center">
                            <CAvatar size="md" src={item.image || ''} />
                            <div className="ms-2 text-start">{item.name || item.full_name}</div>
                          </div>
                        </CTableDataCell>
                        {/* Phone */}
                        <CTableDataCell
                          className="text-center align-middle"
                          style={{ verticalAlign: 'middle', padding: '12px 8px' }}
                        >
                          {item.phone}
                        </CTableDataCell>
                        {/* Email */}
                        <CTableDataCell
                          className="text-center align-middle"
                          style={{ verticalAlign: 'middle', padding: '12px 8px' }}
                        >
                          {item.email}
                        </CTableDataCell>
                        {/* City */}
                        <CTableDataCell
                          className="text-center align-middle"
                          style={{ verticalAlign: 'middle', padding: '12px 8px' }}
                        >
                          {activeKey === 1 ? item.lawyer.city : item.city}
                        </CTableDataCell>
                        {/* Gender/Age */}
                        <CTableDataCell
                          className="text-center align-middle"
                          style={{ verticalAlign: 'middle', padding: '12px 8px' }}
                        >
                          {item?.gender} / {item.age}
                        </CTableDataCell>
                        {/* Status */}

                        <CTableDataCell className="text-center">
                          <CBadge
                            color={
                              item.verification_status === 'Pending'
                                ? 'warning'
                                : item.verification_status === 'Verified'
                                  ? 'success'
                                  : item.verification_status === 'Rejected'
                                    ? 'danger'
                                    : item.verification_status === 'Flagged'
                                      ? 'danger'
                                      : 'secondary'
                            }
                          >
                            {item.verification_status ||
                              (item.status === 'rejected' ? 'Flagged' : 'Not Started')}
                          </CBadge>
                        </CTableDataCell>
                        {/* Action */}
                        <CTableDataCell
                          className="text-center align-middle"
                          style={{ verticalAlign: 'middle', padding: '12px 8px' }}
                        >
                          <div>
                            <FaEye className="me-2" />
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  : renderNoData()}
              </CTableBody>
            </CTable>

            {tableData.length > 0 && (
              <CPagination align="end" className="mt-3 me-3">
                <CPaginationItem
                  aria-label="Previous"
                  disabled={queryParams.page === 1}
                  onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  <span aria-hidden="true">&laquo;</span>
                </CPaginationItem>

                {renderPaginationItems()}

                <CPaginationItem
                  aria-label="Next"
                  disabled={queryParams.page === getTotalPages()}
                  onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  <span aria-hidden="true">&raquo;</span>
                </CPaginationItem>
              </CPagination>
            )}
          </CCard>
        </CTabPane>
      </CTabContent>
    </>
  )
}

export default Tabs
