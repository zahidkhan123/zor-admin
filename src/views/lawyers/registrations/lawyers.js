import React, { useEffect, useState, createRef } from 'react'
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
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
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
} from '@coreui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilUserFollow, cilPlus } from '@coreui/icons'
import { useGetLawyersQuery, useUpdateLawyerMutation } from '../../../services/api'
import { FaCheckCircle } from 'react-icons/fa'

const tabs = [
  { key: 'pending', label: 'New Registrations' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const Registration = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { modified } = location.state || {}
  const [updateLawyer, { isLoading: isUpdating, isSuccess: isUpdated }] = useUpdateLawyerMutation()
  const [activeTab, setActiveTab] = useState('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  useEffect(() => {
    if (location?.state?.tab) {
      setActiveTab(location.state.tab)
      window.history.replaceState({}, document.title)
    }
  }, [location?.state?.tab])
  const { data, error, isLoading, refetch } = useGetLawyersQuery({
    page: currentPage,
    limit: 10,
    type: activeTab,
  })

  useEffect(() => {
    if (location?.state?.lawyerAdded) {
      setToastMessage('Lawyer registered successfully!')
      setToastVisible(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  useEffect(() => {
    if (modified || location?.state?.tab) {
      refetch({ force: true }) // this ensures fresh data
      setToastMessage('Lawyer updated successfully!')
      setToastVisible(true)

      // Clear the navigation state to avoid repeated refetch
      window.history.replaceState({}, document.title)
    }
  }, [modified, activeTab, refetch, location?.state?.tab])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  const handlePageChange = (page) => setCurrentPage(page)

  const renderPaginationItems = () => {
    const totalPages = data?.data?.pagination?.totalPages || 1
    const items = []

    if (totalPages <= 1) return items

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

  const { lawyers, summary } = data.data

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

      {/* Add Button */}
      <CCardBody>
        <CRow className="align-items-center mb-3">
          <CCol xs={12} md={6}>
            <CButton
              color="warning"
              onClick={() => navigate('/lawyers/add', { state: { mode: 'add' } })}
            >
              <CIcon icon={cilPlus} className="me-2" />
              Add New Lawyer
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>
      {/* Tabs */}

      {/* Summary */}
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

      {/* Table */}
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
            {lawyers.map((lawyer) => (
              <CTableRow
                key={lawyer._id}
                onClick={() => navigate(`/registration/view/${lawyer._id}`, { state: { lawyer } })}
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
                <CTableDataCell className="text-center">{`${lawyer?.age} / ${lawyer?.gender_id?.name}`}</CTableDataCell>
                <CTableDataCell className="text-center">
                  <CDropdown alignment="end">
                    <CDropdownToggle color="transparent" size="sm" className="p-0 shadow-none">
                      <span style={{ fontSize: '24px', cursor: 'pointer' }}>⋮</span>
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem
                        onClick={() =>
                          navigate(`/lawyers/view/${lawyer._id}`, { state: { lawyer } })
                        }
                      >
                        View
                      </CDropdownItem>
                      <CDropdownItem
                        onClick={() =>
                          navigate(`/lawyers/edit/${lawyer._id}`, {
                            state: { lawyer, mode: 'edit' },
                          })
                        }
                      >
                        Edit
                      </CDropdownItem>
                      <CDropdownItem href="/lawyers/delete">Delete</CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>

        {/* Pagination */}
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
            disabled={currentPage === (data?.data?.pagination?.totalPages || 1)}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            &raquo;
          </CPaginationItem>
        </CPagination>
      </CCard>
    </>
  )
}

export default Registration
