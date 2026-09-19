import { Loader2, AlertCircle } from 'lucide-react';

export default function DataTableWrapper({ loading, error, dataLength, colSpan, children }) {
  if (loading) {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center py-12 text-gray-400 text-sm">
          <div className="flex justify-center items-center gap-2">
            <Loader2 className="animate-spin text-blue-500" size={20} />
            <span>Processing and loading records...</span>
          </div>
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center py-8 text-red-400 text-sm">
          <div className="flex justify-center items-center gap-2 bg-red-500/10 border border-red-500/20 p-3 rounded-xl mx-4">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        </td>
      </tr>
    );
  }

  if (dataLength === 0) {
    return (
      <tr>
        <td colSpan={colSpan} className="text-center py-8 text-gray-500 text-sm">
          No matching records found in the database.
        </td>
      </tr>
    );
  }

  return children;
}