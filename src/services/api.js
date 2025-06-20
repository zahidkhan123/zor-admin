// services/api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import axios from 'axios'

const getToken = () => {
  const localToken = localStorage.getItem('token')
  return localToken
}
// baseURL: 'https://zor-development.onrender.com/api/v1',
// Create axios instance

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
})

// Custom base query using axios instance
const axiosBaseQuery =
  () =>
  async ({ url, method = 'GET', body, params }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data: body,
        params,
      })
      return { data: result.data }
    } catch (axiosError) {
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data || axiosError.message,
        },
      }
    }
  }

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/admin/users/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getUsers: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/admin/users',
        params: { page, limit },
      }),
    }),
    getUserById: builder.query({
      query: (id) => `admin/users/${id}`,
    }),
    getDropdowns: builder.query({
      query: (type) => ({
        url: '/admin/dropdowns',
        params: { type },
      }),
    }),
    getLawyers: builder.query({
      query: ({ page = 1, limit = 10, type = null }) => ({
        url: '/admin/lawyers',
        params: { page, limit, ...(type && { type }) },
      }),
    }),
    createLawyer: builder.mutation({
      query: (lawyer) => ({
        url: '/admin/lawyers/create-lawyer',
        method: 'POST',
        body: lawyer,
      }),
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: '/admin/users',
        method: 'POST',
        body: user,
      }),
    }),
    getLawyerById: builder.query({
      query: (id) => ({
        url: `/lawyer/${id}`,
        method: 'GET',
      }),
    }),
    getCategories: builder.query({
      query: () => ({
        url: '/admin/categories',
        method: 'GET',
      }),
    }),
    updateLawyer: builder.mutation({
      query: (lawyer) => ({
        url: `/admin/lawyers/update-status`,
        method: 'PUT',
        body: lawyer,
      }),
    }),
    getPendingSubmissions: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/admin/lawyers/pending-submissions?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
    }),
    getVerification: builder.query({
      query: ({ page = 1, limit = 10, status = 'Pending ' }) => ({
        url: `/admin/lawyers/verification-profiles?verification_status=${status}&page=${page}&limit=${limit}`,
        method: 'GET',
      }),
    }),
    getVerificationById: builder.query({
      query: (id) => ({
        url: `/admin/lawyers/verification/${id}`,
        method: 'GET',
      }),
    }),
    verifyDocuments: builder.mutation({
      query: (payload) => ({
        url: '/admin/lawyers/verification-profiles',
        method: 'PUT',
        body: payload,
      }),
    }),
    verifyLawyer: builder.mutation({
      query: (payload) => ({
        url: '/admin/lawyers/update-verification-status',
        method: 'PUT',
        body: payload,
      }),
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetDropdownsQuery,
  useLoginMutation,
  useGetLawyersQuery,
  useCreateLawyerMutation,
  useGetLawyerByIdQuery,
  useGetCategoriesQuery,
  useUpdateLawyerMutation,
  useGetPendingSubmissionsQuery,
  useGetVerificationQuery,
  useGetVerificationByIdQuery,
  useVerifyDocumentsMutation,
  useVerifyLawyerMutation,
  useCreateUserMutation,
} = api
