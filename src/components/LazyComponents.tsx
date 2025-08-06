import React, { Suspense } from 'react';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

// Lazy load heavy dynamic step components
export const LazyChunkProcessorScreen = React.lazy(() => 
  import('@/screens/dynamic-steps/chunkprocessorscreen')
);

export const LazyChunkReaderScreen = React.lazy(() => 
  import('@/screens/dynamic-steps/chunkreaderscreen')
);

export const LazyChunkWriterScreen = React.lazy(() => 
  import('@/screens/dynamic-steps/chunkwriterscreen')
);

export const LazyBatchletDefinitionScreen = React.lazy(() => 
  import('@/screens/dynamic-steps/batchletdefinition')
);

// Wrapper component with Suspense
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
  
  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Pre-wrapped lazy components
export const ChunkProcessorScreen = withSuspense(LazyChunkProcessorScreen);
export const ChunkReaderScreen = withSuspense(LazyChunkReaderScreen);
export const ChunkWriterScreen = withSuspense(LazyChunkWriterScreen);
export const BatchletDefinitionScreen = withSuspense(LazyBatchletDefinitionScreen);