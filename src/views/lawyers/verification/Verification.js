// import React, { useEffect, useState, createRef } from 'react'
// import PropTypes from 'prop-types'
// import classNames from 'classnames'
// import {
//   CRow,
//   CCol,
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CTable,
//   CTableBody,
//   CTableDataCell,
//   CTableHead,
//   CTableHeaderCell,
//   CTableRow,
//   CAvatar,
//   CProgress,
//   CDropdown,
//   CDropdownToggle,
//   CDropdownMenu,
//   CDropdownItem,
//   CButton,
//   CFormInput,
//   CCardGroup,
//   CWidgetStatsC,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { rgbToHex } from '@coreui/utils'
// import avatar1 from 'src/assets/images/avatars/1.jpg'
// import avatar2 from 'src/assets/images/avatars/2.jpg'
// import avatar3 from 'src/assets/images/avatars/3.jpg'
// import avatar4 from 'src/assets/images/avatars/4.jpg'
// import avatar5 from 'src/assets/images/avatars/5.jpg'
// import avatar6 from 'src/assets/images/avatars/6.jpg'
// import {
//   cilPlus,
//   cilPeople,
//   cilUserFollow,
//   cilBasket,
//   cilChartPie,
//   cilSpeedometer,
//   cilSpeech,
// } from '@coreui/icons'
// import { useNavigate } from 'react-router-dom'
// import UserTabs from './tabs'
// const tableExample = [
//   {
//     id: 1,
//     avatar: { src: avatar1 },
//     user: 'Yiorgos Avraamu',
//     phone: '+1 202-555-0147',
//     email: 'yiorgos@example.com',
//     ageGender: '34 / Male',
//   },
//   {
//     id: 2,
//     avatar: { src: avatar2 },
//     user: 'Avram Tarasios',
//     phone: '+55 11 91234-5678',
//     email: 'avram@example.com',
//     ageGender: '28 / Male',
//   },
//   {
//     id: 3,
//     avatar: { src: avatar3 },
//     user: 'Quintin Ed',
//     phone: '+91 98765-43210',
//     email: 'quintin@example.com',
//     ageGender: '42 / Male',
//   },
//   {
//     id: 4,
//     avatar: { src: avatar4 },
//     user: 'Enéas Kwadwo',
//     phone: '+33 6 12 34 56 78',
//     email: 'eneas@example.fr',
//     ageGender: '29 / Male',
//   },
//   {
//     id: 5,
//     avatar: { src: avatar5 },
//     user: 'Agapetus Tadeáš',
//     phone: '+34 612 34 56 78',
//     email: 'agapetus@example.es',
//     ageGender: '36 / Male',
//   },
//   {
//     id: 6,
//     avatar: { src: avatar6 },
//     user: 'Friderik Dávid',
//     phone: '+48 501 234 567',
//     email: 'friderik@example.pl',
//     ageGender: '25 / Male',
//   },
// ]

// const ThemeView = () => {
//   const [color, setColor] = useState('rgb(255, 255, 255)')
//   const ref = createRef()

//   useEffect(() => {
//     const el = ref.current.parentNode.firstChild
//     const varColor = window.getComputedStyle(el).getPropertyValue('background-color')
//     setColor(varColor)
//   }, [ref])

//   return (
//     <table className="table w-100" ref={ref}>
//       <tbody>
//         <tr>
//           <td className="text-body-secondary">HEX:</td>
//           <td className="font-weight-bold">{rgbToHex(color)}</td>
//         </tr>
//         <tr>
//           <td className="text-body-secondary">RGB:</td>
//           <td className="font-weight-bold">{color}</td>
//         </tr>
//       </tbody>
//     </table>
//   )
// }

// const ThemeColor = ({ className, children }) => {
//   const classes = classNames(className, 'theme-color w-75 rounded mb-3')
//   return (
//     <CCol xs={12} sm={6} md={4} xl={2} className="mb-4">
//       <div className={classes} style={{ paddingTop: '75%' }}></div>
//       {children}
//       <ThemeView />
//     </CCol>
//   )
// }

// ThemeColor.propTypes = {
//   children: PropTypes.node,
//   className: PropTypes.string,
// }

// const Verification = () => {
//   const navigate = useNavigate()
//   return (
//     <>
//       <CCard className="mb-4 p-3">
//         <CRow className="justify-content-center">
//           <CCol xs={12} sm={6} lg={6} xxl={6} className="mb-4">
//             <CWidgetStatsC
//               icon={<CIcon icon={cilPeople} height={36} />}
//               value="1238"
//               title="Total Lawyers"
//               progress={{ color: 'warning', value: 75 }}
//             />
//           </CCol>
//           <CCol xs={12} sm={6} lg={6} xxl={6} className="mb-4">
//             <CWidgetStatsC
//               icon={<CIcon icon={cilUserFollow} height={36} />}
//               value="233"
//               title="New Lawyers (This Month)"
//               progress={{ color: 'warning', value: 75 }}
//             />
//           </CCol>
//         </CRow>
//       </CCard>

//       {/* </CCard> */}
//       {/* </CCol> */}
//       <CCard className="mb-4">
//         <CTable align="middle" className="mb-0 border" hover responsive>
//           <UserTabs tableExample={tableExample} path={'/verification/detail'} />
//         </CTable>
//       </CCard>
//     </>
//   )
// }

// export default Verification
import React from 'react'
import { CCard, CCol, CRow, CWidgetStatsC } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilUserFollow } from '@coreui/icons'
import UserTabs from './tabs'

const Verification = () => {
  return (
    <>
      <CCard className="mb-4 p-3">
        <CRow className="justify-content-center">
          <CCol xs={12} sm={6} lg={6} xxl={6}>
            <CWidgetStatsC
              icon={<CIcon icon={cilPeople} height={36} />}
              value={'-'} // You can update this inside the tab component once you have full count
              title="Total Lawyers"
              progress={{ color: 'warning', value: 75 }}
            />
          </CCol>
          <CCol xs={12} sm={6} lg={6} xxl={6}>
            <CWidgetStatsC
              icon={<CIcon icon={cilUserFollow} height={36} />}
              value={'-'} // Same here
              title="New Lawyers (This Month)"
              progress={{ color: 'warning', value: 75 }}
            />
          </CCol>
        </CRow>
      </CCard>

      <CCard className="mb-4">
        <UserTabs path="/verification/detail" />
      </CCard>
    </>
  )
}

export default Verification
