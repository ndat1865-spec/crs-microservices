interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index)

  return (
    <nav className="pagination" aria-label="Phân trang danh sách môn học">
      <button
        type="button"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
      >
        « Trang trước
      </button>

      {pages.map((page) => (
        <button
          type="button"
          key={page}
          className={page === currentPage ? 'pagination__page--active' : undefined}
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={`Trang ${page + 1}`}
          onClick={() => onPageChange(page)}
        >
          {page + 1}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Trang sau »
      </button>
    </nav>
  )
}
