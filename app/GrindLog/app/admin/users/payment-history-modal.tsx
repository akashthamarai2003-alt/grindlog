import { X, Receipt, CheckCircle2, Clock } from "lucide-react";

interface PaymentHistoryModalProps {
  user: any;
  onClose: () => void;
}

export default function PaymentHistoryModal({ user, onClose }: PaymentHistoryModalProps) {
  const history = user.paymentHistory || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
              <p className="text-xs text-gray-500 font-medium">
                {user.display_name} • {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">No payment history found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((payment: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="mt-1">
                    {payment.status === "captured" || payment.status === "authorized" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900 capitalize">
                        {payment.description || "Premium Subscription"}
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        ₹{payment.amount}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-mono bg-gray-200/50 px-1.5 py-0.5 rounded text-[10px]">
                        {payment.id}
                      </span>
                      <span>
                        {new Date(payment.created_at * 1000).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600">Total Lifetime Value</span>
          <span className="text-lg font-bold text-green-600">₹{user.actualPaidAmount}</span>
        </div>
      </div>
    </div>
  );
}
