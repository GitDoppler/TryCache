// test/testCacheSimulator.ts
import { strict as assert } from "assert";
import {
  initializeCache,
  convertAddr,
  readFromMainMemory,
  writeToMainMemory,
  handleCacheMiss,
  handleCacheHit,
} from "../hooks/useCacheV2";

function testInitializeCache() {
  const cache = initializeCache(4, "direct-mapped");
  assert.equal(
    cache.sets.length,
    4,
    "Cache should have 4 sets for direct mapped",
  );
  assert.equal(
    cache.sets[0].lines.length,
    1,
    "Each set should have 1 line for direct mapped",
  );
  console.log("testInitializeCache passed");
}

function testConvertAddr() {
  const { setIndex, tag } = convertAddr(10, 4, "direct-mapped");
  assert.equal(setIndex, 10 % 4, "Set index should be address % numSets");
  assert.equal(
    tag,
    10,
    "Tag should be the same as address in this simplified mapping",
  );
  console.log("testConvertAddr passed");
}

function testReadFromMainMemory() {
  const data = readFromMainMemory(10);
  assert.equal(
    data,
    "data10",
    "Should read 'data10' from memory for address 10",
  );
  console.log("testReadFromMainMemory passed");
}

function testWriteToMainMemory() {
  writeToMainMemory(200, "data200");
  const data = readFromMainMemory(200);
  assert.equal(
    data,
    "data200",
    "Should write and then read back 'data200' from memory",
  );
  console.log("testWriteToMainMemory passed");
}

function testHandleCacheMiss() {
  let cache = initializeCache(4, "direct-mapped");
  const address = 10;
  const { setIndex, tag } = convertAddr(address, 4, "direct-mapped");
  const memoryData = readFromMainMemory(address);

  cache = handleCacheMiss(
    cache,
    setIndex,
    tag,
    memoryData,
    "direct-mapped",
    "LRU",
    "write-back",
    false,
  );

  const line = cache.sets[setIndex].lines[0];
  assert.equal(line.valid, true, "Line should be valid after miss");
  assert.equal(
    line.data,
    "data10",
    "Line data should match the main memory data at address 10",
  );
  console.log("testHandleCacheMiss passed");
}

function testHandleCacheHit() {
  // Create a scenario for a hit by first inserting a line
  let cache = initializeCache(4, "direct-mapped");
  const address = 10;
  const { setIndex, tag } = convertAddr(address, 4, "direct-mapped");
  const memoryData = readFromMainMemory(address);

  // Insert the line into the cache by simulating a miss
  cache = handleCacheMiss(
    cache,
    setIndex,
    tag,
    memoryData,
    "direct-mapped",
    "LRU",
    "write-back",
    false,
  );

  // Now there's a valid line at setIndex
  const line = cache.sets[setIndex].lines[0];
  assert.equal(
    line.data,
    "data10",
    "Line should contain 'data10' before the hit",
  );

  // Perform a hit with a write
  const newData = "data10_modified";
  cache = handleCacheHit(cache, setIndex, line, newData, "write-back");
  const updatedLine = cache.sets[setIndex].lines[0];

  assert.equal(
    updatedLine.data,
    newData,
    "After hit with write-back, the line should have updated data",
  );
  assert.equal(
    updatedLine.dirty,
    true,
    "Line should be dirty after write-back write",
  );
  console.log("testHandleCacheHit passed");
}

// Run all tests
testInitializeCache();
testConvertAddr();
testReadFromMainMemory();
testWriteToMainMemory();
testHandleCacheMiss();
testHandleCacheHit();

console.log("All tests passed!");
