import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import type { ApiErrorResponse } from '../types/apiError'
import type { Course } from '../types/course'
import { getCourses } from './courseApi'

export type LoadState = 'loading' | 'success' | 'empty' | 'error'

interface CourseResult {
  requestKey: string
  courses: Course[]
  totalPages: number
  state: Exclude<LoadState, 'loading'>
  errorMessage: string
}

export function useCourses(keyword: string, page: number, size = 10) {
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState<CourseResult | null>(null)
  const requestKey = `${keyword}\u0000${page}\u0000${size}\u0000${reloadCount}`

  useEffect(() => {
    let active = true

    getCourses(keyword, page, size)
      .then((response) => {
        if (!active) return

        const data = response.data
        setResult({
          requestKey,
          courses: data.content,
          totalPages: data.totalPages,
          state: data.content.length === 0 ? 'empty' : 'success',
          errorMessage: '',
        })
      })
      .catch((error: unknown) => {
        if (!active) return

        let message = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'

        if (axios.isAxiosError<ApiErrorResponse>(error)) {
          if (error.response?.data?.message) {
            message = error.response.data.message
          } else if (!error.response) {
            message = 'Không kết nối được tới hệ thống. Vui lòng thử lại sau.'
          }
        }

        setResult({
          requestKey,
          courses: [],
          totalPages: 0,
          state: 'error',
          errorMessage: message,
        })
      })

    return () => {
      active = false
    }
  }, [keyword, page, requestKey, size])

  const refetch = useCallback(() => {
    setReloadCount((current) => current + 1)
  }, [])

  const isCurrentResult = result?.requestKey === requestKey
  const state: LoadState = isCurrentResult ? result.state : 'loading'

  return {
    courses: isCurrentResult ? result.courses : [],
    totalPages: isCurrentResult ? result.totalPages : 0,
    state,
    errorMessage: isCurrentResult ? result.errorMessage : '',
    refetch,
  }
}
