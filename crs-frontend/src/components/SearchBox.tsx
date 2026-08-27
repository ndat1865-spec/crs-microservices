import { useEffect, useState } from 'react'

interface SearchBoxProps {
  onSearch: (keyword: string) => void
  placeholder?: string
}

export default function SearchBox({ onSearch, placeholder }: SearchBoxProps) {
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearch(inputValue.trim())
    }, 400)

    return () => window.clearTimeout(timer)
  }, [inputValue, onSearch])

  return (
    <label className="search-box">
      <span className="search-box__label">Tìm kiếm môn học</span>
      <input
        type="search"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder={placeholder ?? 'Nhập tên môn học...'}
      />
    </label>
  )
}
