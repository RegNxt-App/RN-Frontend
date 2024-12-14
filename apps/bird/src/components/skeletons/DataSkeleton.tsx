import { Skeleton } from "@/components/ui/skeleton"

const DataSkeleton = () => {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <Skeleton className="h-8 w-48" /> {/* Title */}
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-[250px]" /> {/* Framework dropdown */}
        <Skeleton className="h-10 w-[250px]" /> {/* Layer dropdown */}
      </div>
      <Skeleton className="h-6 w-96" /> {/* Table count text */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" /> /* Table rows */
        ))}
      </div>
    </div>
  )
}

export default DataSkeleton