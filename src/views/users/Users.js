import React, { useEffect, useState, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAvatar,
  CProgress,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton,
  CFormInput,
  CCardGroup,
  CWidgetStatsC,
  CSpinner,
  CImage,
} from '@coreui/react'
import { CPagination, CPaginationItem } from '@coreui/react'
import { debounce } from 'lodash'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPeople, cilUserFollow, cilSearch } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { useGetUsersQuery } from '../../services/api'
import { fetchSignedUrl } from '../../assets/utils/imageUtils'
const ThemeView = () => {
  const [color, setColor] = useState('rgb(255, 255, 255)')
  const ref = React.createRef()

  useEffect(() => {
    const el = ref.current.parentNode.firstChild
    const varColor = window.getComputedStyle(el).getPropertyValue('background-color')
    setColor(varColor)
  }, [ref])

  return (
    <table className="table w-100" ref={ref}>
      <tbody>
        <tr>
          <td className="text-body-secondary">HEX:</td>
          <td className="font-weight-bold">{rgbToHex(color)}</td>
        </tr>
        <tr>
          <td className="text-body-secondary">RGB:</td>
          <td className="font-weight-bold">{color}</td>
        </tr>
      </tbody>
    </table>
  )
}

const ThemeColor = ({ className, children }) => {
  const classes = classNames(className, 'theme-color w-75 rounded mb-3')
  return (
    <CCol xs={12} sm={6} md={4} xl={2} className="mb-4">
      <div className={classes} style={{ paddingTop: '75%' }}></div>
      {children}
      <ThemeView />
    </CCol>
  )
}

ThemeColor.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

const Users = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [avatarUrls, setAvatarUrls] = useState({})
  const [loadingAvatars, setLoadingAvatars] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  const debouncedSearch = useRef(
    debounce((term) => {
      setDebouncedSearchTerm(term)
    }, 500),
  ).current

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const { data, error, isLoading } = useGetUsersQuery({
    page: currentPage,
    limit: 10,
    search: debouncedSearchTerm, // ✅ passed to API
  })

  useEffect(() => {
    const fetchAvatars = async () => {
      if (!data?.data?.users) return

      setLoadingAvatars(true)
      const newAvatarUrls = {}

      for (const user of data.data.users) {
        try {
          const url = user?.image ? await fetchSignedUrl(user.image) : ''
          newAvatarUrls[user._id] = url || 'https://via.placeholder.com/50'
        } catch (error) {
          console.error(`Error fetching avatar for user ${user._id}:`, error)
          newAvatarUrls[user._id] = 'https://via.placeholder.com/50'
        }
      }

      setAvatarUrls(newAvatarUrls)
      setLoadingAvatars(false)
    }

    fetchAvatars()
  }, [data])

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
          <h4>Error fetching users</h4>
          <p>{error.message}</p>
        </div>
      </div>
    )
  }

  const { users, summary, pagination } = data.data

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const renderPaginationItems = () => {
    const totalPages = pagination.totalPages
    const items = []

    // Always show first page
    items.push(
      <CPaginationItem key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>
        1
      </CPaginationItem>,
    )

    // Show ellipsis if there are more than 3 pages before current page
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

    // Show ellipsis if there are more than 3 pages after current page
    if (currentPage < totalPages - 2) {
      items.push(
        <CPaginationItem key="ellipsis2" disabled>
          ...
        </CPaginationItem>,
      )
    }

    // Always show last page if there is more than one page
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

  return (
    <>
      <CCard className="mb-4 p-3">
        <CRow className="justify-content-center">
          <CCol xs={12} sm={6} lg={6} xxl={6} className="mb-4">
            <CWidgetStatsC
              icon={<CIcon icon={cilPeople} height={36} />}
              value={summary.totalUsers.toString()}
              title="Total Users"
              progress={{ color: 'warning', value: 75 }}
            />
          </CCol>
          <CCol xs={12} sm={6} lg={6} xxl={6} className="mb-4">
            <CWidgetStatsC
              icon={<CIcon icon={cilUserFollow} height={36} />}
              value={summary.newUsersThisMonth.toString()}
              title="New Users (This Month)"
              progress={{ color: 'warning', value: 75 }}
            />
          </CCol>
        </CRow>
      </CCard>

      {/* <CCardBody>
        <CRow className="align-items-center mb-3">
          <CCol xs={12} md={6}></CCol>
        </CRow>
      </CCardBody> */}

      <CCardBody>
        <CRow
          className="align-items-center justify-content-between mb-3"
          style={{ marginRight: 0 }}
        >
          {/* Add New User Button */}
          <CCol xs="auto" className="p-3">
            <CButton color="warning" onClick={() => navigate('/users/add')}>
              <CIcon icon={cilPlus} className="me-2" />
              Add New User
            </CButton>
          </CCol>

          {/* Search Field */}
          <CCol xs="auto" className="p-0">
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
                  width: '300px', // 🔹 Reduced width for a cleaner look
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
        <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead className="text-nowrap">
            <CTableRow>
              <CTableHeaderCell className="bg-body-tertiary text-center">ID</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-center">Picture</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-center">User</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-center">Phone</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-center">Email</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-center">
                Age & Gender
              </CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-center">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {users.map((user) => (
              <CTableRow
                key={user._id}
                onClick={() => navigate(`/users/view/${user._id}`, { state: { user } })}
                style={{ cursor: 'pointer' }}
              >
                <CTableDataCell className="text-center">
                  {user._id.slice(-5).toUpperCase()}
                </CTableDataCell>
                <CTableDataCell className="text-center">
                  {loadingAvatars ? (
                    <CSpinner size="sm" />
                  ) : (
                    <CImage
                      key={user._id}
                      src={avatarUrls[user._id]}
                      thumbnail
                      style={{
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        cursor: 'pointer',
                      }}
                      crossOrigin="anonymous"
                    />
                  )}
                </CTableDataCell>
                <CTableDataCell className="text-center">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="ms-2 text-start" style={{ minWidth: '120px' }}>
                      {user?.name || 'N/A'}
                    </div>
                  </div>
                </CTableDataCell>
                <CTableDataCell className="text-center">{user?.phone || 'N/A'}</CTableDataCell>
                <CTableDataCell className="text-center">{user?.email || 'N/A'}</CTableDataCell>
                <CTableDataCell className="text-center">{`${user?.age} / ${user?.gender}`}</CTableDataCell>
                <CTableDataCell className="text-center">
                  <CDropdown alignment="end">
                    <CDropdownToggle
                      color="transparent"
                      size="sm"
                      caret={false}
                      className="p-0 border-0 shadow-none"
                    >
                      <span
                        style={{
                          fontSize: '24px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          marginLeft: '30px',
                        }}
                      >
                        ⋮
                      </span>
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem
                        onClick={() => navigate(`/users/view/${user._id}`, { state: { user } })}
                      >
                        View
                      </CDropdownItem>
                      {/* <CDropdownItem onClick={() => navigate(`/users/edit/${user._id}`)}>
                        Edit
                      </CDropdownItem> */}
                      <CDropdownItem href="/users/delete">Delete</CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        <CPagination align="end" className="mt-3 me-3">
          <CPaginationItem
            aria-label="Previous"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <span aria-hidden="true">&laquo;</span>
          </CPaginationItem>
          {renderPaginationItems()}
          <CPaginationItem
            aria-label="Next"
            disabled={currentPage === pagination.totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <span aria-hidden="true">&raquo;</span>
          </CPaginationItem>
        </CPagination>
      </CCard>
    </>
  )
}

export default Users
