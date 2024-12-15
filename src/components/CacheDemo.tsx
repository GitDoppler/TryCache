"use client";

import { useState } from "react";
import {
  CacheConfigurationForm,
  ConfigFormValues,
} from "./CacheConfigurationForm";
import { WriteForm } from "./WriteForm";
import { ReadForm } from "./ReadForm";
import { CacheTable } from "./CacheTable";
import { useCache } from "@/hooks/useCacheV2";

export default function CacheDemo() {
  // Initialize with some default values so useCache is always called.
  const [cacheParams, setCacheParams] = useState<ConfigFormValues>({
    numSets: 8,
    cacheType: "direct-mapped",
    replacementPolicy: "LRU",
    writePolicy: "write-back",
  });

  const [configured, setConfigured] = useState(false);

  // Always call useCache
  const { cache, readFromCache, writeToCache } = useCache(
    cacheParams.numSets,
    cacheParams.cacheType,
    cacheParams.replacementPolicy,
    cacheParams.writePolicy,
  );

  const handleConfigured = (values: ConfigFormValues) => {
    // Update parameters and mark as configured
    setCacheParams(values);
    setConfigured(true);
  };

  return (
    <div className="p-4 space-y-10">
      {!configured && (
        <div>
          <h2 className="text-xl font-bold mb-4">Configure Your Cache</h2>
          <CacheConfigurationForm onConfigured={handleConfigured} />
        </div>
      )}

      {configured && cache && (
        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold mb-4">Cache Operations</h2>
            <div className="flex space-x-10">
              <WriteForm writeToCache={writeToCache} />
              <ReadForm readFromCache={readFromCache} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Cache State</h2>
            <CacheTable cache={cache} />
          </div>
        </div>
      )}
    </div>
  );
}
