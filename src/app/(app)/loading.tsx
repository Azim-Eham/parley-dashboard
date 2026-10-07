export default function Loading() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 space-y-4 sm:space-y-0 animate-pulse">
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Company', 'Source', 'Status', 'Created'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded mb-2"></div><div className="h-3 w-24 bg-gray-100 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
