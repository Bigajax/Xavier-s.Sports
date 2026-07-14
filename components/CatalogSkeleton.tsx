/** Skeleton de carregamento do catálogo. */
export default function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 md:px-6" aria-busy="true" aria-label="Carregando catálogo">
      <div className="h-4 w-24 rounded bg-cloud" />
      <div className="mt-3 h-10 w-2/3 max-w-md rounded bg-cloud" />
      <div className="mt-3 h-4 w-1/2 max-w-sm rounded bg-cloud" />
      <div className="mt-10 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl ring-1 ring-ink/5">
            <div className="aspect-square bg-cloud" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/2 rounded bg-cloud" />
              <div className="h-4 w-3/4 rounded bg-cloud" />
              <div className="h-4 w-1/3 rounded bg-cloud" />
              <div className="h-9 rounded bg-cloud" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
