import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  CButton,
  CForm,
  CFormInput,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CSpinner,
  CToast,
  CToastBody,
  CToaster,
  CToastClose,
} from '@coreui/react'
import { FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa'
import { login } from '../../../store/slices/authSlice'
import { useLoginMutation } from '../../../services/api'
import { cilPeople } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '', color: 'danger' })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [loginMutation, { isLoading, error: loginError }] = useLoginMutation()
  const localUser = localStorage.getItem('user')
  useEffect(() => {
    if (localUser) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [localUser, navigate, location])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev)
  }

  const showToast = (message, color = 'danger') => {
    setToast({ visible: true, message, color })
    setTimeout(() => {
      setToast({ visible: false, message: '', color: 'danger' })
    }, 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const data = { user_type: 'admin', email: form.email, password: form.password }
      const response = await loginMutation(data).unwrap()

      // Store only necessary user data in localStorage
      const userData = {
        _id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        user_type: response.data.user.user_type,
        is_verified: response.data.user.is_verified,
        image: response.data.user.image,
      }

      // Store token in localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(userData))

      // Store full user data in Redux store and set authentication state
      dispatch(login(response.data))
      dispatch({ type: 'setAuth', isAuthenticated: true })

      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (err) {
      showToast(err.data?.message || 'Invalid email or password')
    }
  }

  return (
    <div className="d-flex min-vh-100">
      {/* Left Branding Section */}
      <div className="w-50 d-flex flex-column justify-content-center align-items-center bg-dark text-white">
        <h1 className="display-1 fw-bold">
          ZOR<span className="text-warning">.</span>
        </h1>
        <p className="text-center mt-3 px-5">Your trusted lawyer booking platform</p>
      </div>

      {/* Right Login Form Section */}
      <div className="w-50 d-flex align-items-center bg-light">
        <CContainer>
          <CCol lg={10} className="mx-auto">
            <CCardBody>
              <div className="text-center mb-4">
                <h2 className="fw-bold text-black">
                  ZOR<span className="text-warning">.</span>
                </h2>
                <p className="text-black small">Please login to continue</p>
              </div>

              <CForm onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
                <CFormLabel htmlFor="email" className="text-black">
                  Email
                </CFormLabel>
                <CInputGroup className="mb-3">
                  <CFormInput
                    className="text-black bg-light"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={{ color: 'black' }}
                  />
                </CInputGroup>

                <CFormLabel htmlFor="password" className="text-black">
                  Password
                </CFormLabel>
                <CInputGroup className="mb-3">
                  <CFormInput
                    className="text-black bg-light"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{ color: 'black' }}
                  />
                  <CInputGroupText onClick={handleTogglePassword} style={{ cursor: 'pointer' }}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </CInputGroupText>
                </CInputGroup>

                <CButton type="submit" color="warning" className="w-100 text-white fw-semibold">
                  {isLoading ? <CSpinner size="sm" /> : 'Log In'}
                </CButton>
              </CForm>
            </CCardBody>
          </CCol>
        </CContainer>
      </div>

      {/* Toast Notification */}
      <CToaster placement="top-end" className="mt-4">
        {loginError && (
          <CToast
            autohide={true}
            color="danger"
            className="border-0 shadow-lg toast-slide-in"
            visible={true}
            style={{
              background: 'linear-gradient(135deg, #dc3545, #ff6f61)',
              color: '#fff',
              borderRadius: '0.75rem',
              padding: '0rem 1rem 0rem 1rem',
              minWidth: '320px',
            }}
          >
            <div className="d-flex align-items-center">
              <FaExclamationCircle size={22} className="me-3" />
              <CToastBody className="fw-semibold flex-grow-1">
                {loginError?.data?.message || 'Something went wrong!'}
              </CToastBody>
              <CToastClose className="ms-3 m-auto" style={{ color: '#fff' }} />
            </div>
          </CToast>
        )}
      </CToaster>
    </div>
  )
}

export default Login
