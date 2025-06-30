import React, { useEffect, useState, createRef } from 'react'
import { useLocation } from 'react-router-dom'
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
  CToaster,
  CToast,
  CToastHeader,
  CToastBody,
  CImage,
} from '@coreui/react'
import { CPagination, CPaginationItem } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { rgbToHex } from '@coreui/utils'
import { cilPlus, cilPeople, cilUserFollow } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { useGetLawyersQuery } from '../../../services/api'
import { fetchSignedUrl } from '../../../assets/utils/imageUtils'

const ThemeView = () => {
  const [color, setColor] = useState('rgb(255, 255, 255)')
  const ref = createRef()

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

const AllLawyer = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const { data, error, isLoading } = useGetLawyersQuery({ page: currentPage, limit: 10 })
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const location = useLocation()
  const [avatarUrls, setAvatarUrls] = useState({})

  useEffect(() => {
    if (location?.state?.lawyerAdded) {
      setToastMessage('Lawyer registered successfully!')
      setToastVisible(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // Fetch signed URLs for all lawyer images
  useEffect(() => {
    const fetchAvatars = async () => {
      if (data?.data?.lawyers) {
        const promises = data.data.lawyers.map(async (lawyer) => {
          if (lawyer?.image) {
            try {
              const url = await fetchSignedUrl(lawyer.image)
              return { id: lawyer._id, url }
            } catch (e) {
              return { id: lawyer._id, url: '' }
            }
          }
          return { id: lawyer._id, url: '' }
        })
        const results = await Promise.all(promises)
        const urlMap = {}
        results.forEach(({ id, url }) => {
          urlMap[id] = url
        })
        setAvatarUrls(urlMap)
      }
    }
    fetchAvatars()
  }, [data])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const renderPaginationItems = () => {
    const totalPages = data?.data?.pagination?.totalPages
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
          <h4>Error fetching Lawyers</h4>
        </div>
      </div>
    )
  }

  const { lawyers, summary, pagination } = data.data

  return (
    <>
      <CToaster position="top-end" className="mt-4">
        {toastVisible && (
          <CToast
            autohide={true}
            visible={true}
            color="success"
            onClose={() => setToastVisible(false)}
          >
            <CToastHeader closeButton>
              <strong className="me-auto">Success</strong>
            </CToastHeader>
            <CToastBody>{toastMessage}</CToastBody>
          </CToast>
        )}
      </CToaster>
      <>
        <CCard className="mb-4 p-3">
          <CRow className="justify-content-center">
            <CCol xs={12} sm={6} lg={6} xxl={6} className="mb-4">
              <CWidgetStatsC
                icon={<CIcon icon={cilPeople} height={36} />}
                value={summary?.total_lawyers?.toString()}
                title="Total Lawyers"
                progress={{ color: 'warning', value: 75 }}
              />
            </CCol>
            <CCol xs={12} sm={6} lg={6} xxl={6} className="mb-4">
              <CWidgetStatsC
                icon={<CIcon icon={cilUserFollow} height={36} />}
                value={summary?.new_lawyers_this_month?.toString()}
                title="New Lawyers (This Month)"
                progress={{ color: 'warning', value: 75 }}
              />
            </CCol>
          </CRow>
        </CCard>

        {/* <CCardBody>
          <CRow className="align-items-center mb-3">
            <CCol xs={12} md={6}>
              <CButton
                color="warning"
                onClick={() => navigate('/profile/add', { state: { mode: 'add' } })}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Add Profile
              </CButton>
            </CCol>
          </CRow>
        </CCardBody> */}

        <CCard className="mb-4">
          <CTable align="middle" className="mb-0 border" hover responsive>
            <CTableHead className="text-nowrap">
              <CTableRow>
                <CTableHeaderCell className="bg-body-tertiary text-center">ID</CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary text-center">
                  Picture
                </CTableHeaderCell>
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
                  onClick={() => navigate(`/profile/edit/${lawyer._id}`, { state: { lawyer } })}
                >
                  <CTableDataCell className="text-center">
                    {lawyer?._id?.slice(-5)?.toUpperCase()}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CImage
                      key={lawyer._id}
                      src={avatarUrls[lawyer._id] || ''}
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
                  </CTableDataCell>
                  {/* <CTableDataCell className="text-center"></CTableDataCell> */}
                  <CTableDataCell className="text-center">
                    {/* <div className="d-flex align-items-center justify-content-center"> */}
                    <div className="ms-2 text-start" style={{ minWidth: '120px' }}>
                      {lawyer?.name}
                    </div>
                    {/* </div> */}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">{lawyer?.phone}</CTableDataCell>
                  <CTableDataCell className="text-center">{lawyer?.email}</CTableDataCell>
                  <CTableDataCell className="text-center">{`${lawyer?.age} / ${lawyer?.gender_id?.name}`}</CTableDataCell>
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
                          onClick={() =>
                            navigate(`/profile/view/${lawyer._id}`, { state: { lawyer } })
                          }
                        >
                          View
                        </CDropdownItem>
                        <CDropdownItem
                          onClick={() =>
                            navigate(`/profile/edit/${lawyer._id}`, {
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
          <CPagination align="end" className="mt-3 me-3">
            <CPaginationItem
              aria-label="Previous"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <span aria-hidden="true">&laquo;</span>
            </CPaginationItem>
            {renderPaginationItems()}
          </CPagination>
        </CCard>
      </>
    </>
  )
}

export default AllLawyer
