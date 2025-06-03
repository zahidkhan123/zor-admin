import React from 'react'
import { CCol, CContainer, CRow } from '@coreui/react'

const Page404 = () => {
  return (
    <div
      className="min-vh-100 d-flex flex-row align-items-center"
      style={{ backgroundColor: '#000', color: '#FFF' }} // black background, yellow text
    >
      <CContainer>
        <CRow className="justify-content-center text-center">
          <CCol md={8}>
            <div className="clearfix">
              <h1 className="display-1 fw-bold" style={{ fontSize: '8rem' }}>
                404
              </h1>
              <h4 className="pt-3 fw-semibold">Oops! You&apos;re lost.</h4>
              <p className="lead text-white">The page you are looking for was not found.</p>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Page404
