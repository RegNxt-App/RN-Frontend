import {Skeleton} from '@rn/ui/components/ui/skeleton';

const DataSkeleton = () => {
  return (
    <div className="container mx-auto py-10 space-y-4">
      {/* Header skeleton */}
      <Skeleton className="h-8 w-48" />

      {/* Filters skeleton */}
      <div className="flex space-x-4 mb-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Table header skeleton */}
      <div className="flex space-x-4">
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <Skeleton
              key={i}
              className="h-8 w-32"
            />
          ))}
      </div>

      {/* Table rows skeleton */}
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            className="flex space-x-4"
          >
            {Array(4)
              .fill(null)
              .map((_, j) => (
                <Skeleton
                  key={j}
                  className="h-12 w-32"
                />
              ))}
          </div>
        ))}
    </div>
  );
};

export default DataSkeleton;
