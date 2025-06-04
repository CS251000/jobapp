// app/(your‐route)/loading.js

export default function Loading() {
  return (
    <div className="p-8 max-w-4xl mx-auto animate-pulse">
      {/* 1. Page Heading Skeleton */}
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>

      {/* 2. First two inputs: Company Name + Contact Person */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>

      {/* 3. Next two inputs: Email + Phone Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>

      {/* 4. Website (full-width) */}
      <div className="h-12 bg-gray-200 rounded mb-4"></div>

      {/* 5. Address (textarea) */}
      <div className="h-24 bg-gray-200 rounded mb-6"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>

      <div className="h-12 bg-gray-200 rounded mb-4"></div>

      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  )
}
