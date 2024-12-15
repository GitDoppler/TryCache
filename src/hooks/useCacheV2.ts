import { useEffect, useState } from "react";
import { Cache, CacheLine, CacheSet } from "@/types/cache";

import rawMemoryData from "@/memory.json";

const mainMemoryData = rawMemoryData as Record<string, string>;

export type CacheType = "direct-mapped" | "set-associative";
export type ReplacementPolicy = "LRU" | "Random";
export type WritePolicy = "write-back" | "write-through";

export function initializeCache(numSets: number, cacheType: CacheType): Cache {
  return {
    sets: Array.from({ length: numSets }, () => ({
      lines: Array.from(
        {
          length: cacheType === "direct-mapped" ? 1 : 4,
        },
        (): CacheLine => ({
          valid: false,
          tag: 0,
          data: "",
          dirty: false,
          lruCounter: 0,
        }),
      ),
    })),
  };
}

export function convertAddr(
  address: number,
  numSets: number,
  cacheType: CacheType,
): { setIndex: number; tag: number } {
  if (cacheType === "direct-mapped") {
    return {
      setIndex: address % numSets,
      tag: address,
    };
  } else {
    return {
      setIndex: address % numSets,
      tag: address,
    };
  }
}

export function updateLRUCounters(
  cacheSet: CacheSet,
  accessedLine: CacheLine,
): CacheSet {
  return {
    ...cacheSet,
    lines: cacheSet.lines.map((line) => ({
      ...line,
      lruCounter: line.tag === accessedLine.tag ? 0 : line.lruCounter + 1,
    })),
  };
}

export function getLRU(cacheSet: CacheSet): CacheLine {
  return cacheSet.lines.reduce((prev, current) =>
    prev.lruCounter > current.lruCounter ? prev : current,
  );
}

export function getRandomLine(cacheSet: CacheSet): CacheLine {
  const randomIndex = Math.floor(Math.random() * cacheSet.lines.length);
  return cacheSet.lines[randomIndex];
}

export function readFromMainMemory(address: number): string {
  return mainMemoryData[address.toString()] ?? `data_at_${address}`;
}

export function writeToMainMemory(address: number, data: string): void {
  mainMemoryData[address.toString()] = data;
}

export function handleCacheMiss(
  cache: Cache,
  setIndex: number,
  tag: number,
  data: string,
  cacheType: CacheType,
  replacementPolicy: ReplacementPolicy,
  writePolicy: WritePolicy,
  isWrite: boolean,
): Cache {
  const cacheSet = cache.sets[setIndex];

  let lineToEvict: CacheLine;
  if (cacheType === "set-associative") {
    lineToEvict =
      replacementPolicy === "LRU" ? getLRU(cacheSet) : getRandomLine(cacheSet);
  } else {
    lineToEvict = cacheSet.lines[0]; // direct-mapped, single line
  }

  // Write back if dirty and write-back policy
  if (lineToEvict.valid && lineToEvict.dirty && writePolicy === "write-back") {
    console.log(`Writing back dirty line with tag: ${lineToEvict.tag}`);
    writeToMainMemory(lineToEvict.tag, lineToEvict.data);
  }

  const updatedLine: CacheLine = {
    valid: true,
    tag,
    data,
    dirty: isWrite && writePolicy === "write-back" ? true : false,
    lruCounter: 0,
  };

  // On write-through, update main memory immediately
  if (isWrite && writePolicy === "write-through") {
    writeToMainMemory(tag, data);
  }

  // Replace the evicted line
  const updatedSet: CacheSet = {
    ...cacheSet,
    lines: cacheSet.lines.map((line) =>
      line === lineToEvict ? updatedLine : line,
    ),
  };

  // Update LRU counters for the set
  const updatedSetWithLRU = updateLRUCounters(updatedSet, updatedLine);

  return {
    ...cache,
    sets: cache.sets.map((set, idx) =>
      idx === setIndex ? updatedSetWithLRU : set,
    ),
  };
}

export function handleCacheHit(
  cache: Cache,
  setIndex: number,
  accessedLine: CacheLine,
  data: string | null = null,
  writePolicy: WritePolicy = "write-back",
): Cache {
  const cacheSet = cache.sets[setIndex];
  let updatedLine: CacheLine = accessedLine;

  if (data !== null) {
    updatedLine = { ...accessedLine, data };

    if (writePolicy === "write-through") {
      writeToMainMemory(accessedLine.tag, data);
      updatedLine.dirty = false;
    } else {
      updatedLine.dirty = true;
    }
  }

  const updatedSet = updateLRUCounters(cacheSet, updatedLine);

  return {
    ...cache,
    sets: cache.sets.map((set, idx) =>
      idx === setIndex
        ? {
            ...updatedSet,
            lines: updatedSet.lines.map((line) =>
              line.tag === updatedLine.tag ? updatedLine : line,
            ),
          }
        : set,
    ),
  };
}

export const useCache = (
  numSets: number,
  cacheType: CacheType,
  replacementPolicy: ReplacementPolicy = "LRU",
  writePolicy: WritePolicy = "write-back",
) => {
  const [cache, setCache] = useState<Cache>(() =>
    initializeCache(numSets, cacheType),
  );

  useEffect(() => {
    const newCache = initializeCache(numSets, cacheType);
    setCache(newCache);
  }, [numSets, cacheType, replacementPolicy, writePolicy]);

  const readFromCache = (address: number): string | null => {
    const { setIndex, tag } = convertAddr(address, numSets, cacheType);
    const cacheSet = cache.sets[setIndex];
    const cacheLine = cacheSet.lines.find(
      (line) => line.valid && line.tag === tag,
    );

    if (!cacheLine) {
      console.log("[CACHE MISS - READ]");
      const memoryData = readFromMainMemory(address);
      const updatedCache = handleCacheMiss(
        cache,
        setIndex,
        tag,
        memoryData,
        cacheType,
        replacementPolicy,
        writePolicy,
        false, // read miss
      );
      setCache(updatedCache);
      return memoryData;
    }

    console.log("[CACHE HIT - READ]");
    const updatedCache = handleCacheHit(
      cache,
      setIndex,
      cacheLine,
      null,
      writePolicy,
    );
    setCache(updatedCache);
    return cacheLine.data;
  };

  const writeToCache = (address: number, data: string): void => {
    const { setIndex, tag } = convertAddr(address, numSets, cacheType);
    const cacheSet = cache.sets[setIndex];
    const cacheLine = cacheSet.lines.find(
      (line) => line.valid && line.tag === tag,
    );

    if (!cacheLine) {
      console.log("[CACHE MISS - WRITE]");
      readFromMainMemory(tag); // fetch data (not necessarily needed to store if not used)
      const updatedCache = handleCacheMiss(
        cache,
        setIndex,
        tag,
        data,
        cacheType,
        replacementPolicy,
        writePolicy,
        true, // write miss
      );
      setCache(updatedCache);
      return;
    }

    console.log("[CACHE HIT - WRITE]");
    const updatedCache = handleCacheHit(
      cache,
      setIndex,
      cacheLine,
      data,
      writePolicy,
    );
    setCache(updatedCache);
  };

  return { cache, readFromCache, writeToCache };
};
