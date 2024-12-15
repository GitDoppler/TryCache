import { Cache } from "@/types/cache";

export function CacheTable({ cache }: { cache: Cache }) {
  return (
    <div className="overflow-auto">
      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Set #</th>
            <th className="border px-2 py-1">Line #</th>
            <th className="border px-2 py-1">Valid</th>
            <th className="border px-2 py-1">Tag</th>
            <th className="border px-2 py-1">Data</th>
            <th className="border px-2 py-1">Dirty</th>
            <th className="border px-2 py-1">LRU Counter</th>
          </tr>
        </thead>
        <tbody>
          {cache.sets.map((cacheSet, setIndex) =>
            cacheSet.lines.map((line, lineIndex) => (
              <tr key={`set-${setIndex}-line-${lineIndex}`}>
                {lineIndex === 0 && (
                  <td
                    className="border px-2 py-1"
                    rowSpan={cacheSet.lines.length}
                  >
                    {setIndex}
                  </td>
                )}
                <td className="border px-2 py-1">{lineIndex}</td>
                <td className="border px-2 py-1">
                  {line.valid ? "Yes" : "No"}
                </td>
                <td className="border px-2 py-1">{line.tag}</td>
                <td className="border px-2 py-1">{line.data}</td>
                <td className="border px-2 py-1">
                  {line.dirty ? "Yes" : "No"}
                </td>
                <td className="border px-2 py-1">{line.lruCounter}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
