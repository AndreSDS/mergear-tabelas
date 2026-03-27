"use client";

import { Toaster, toast, Toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        className: 'group',
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
        success: {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
        },
        error: {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
        },
      }}
    />
  );
}

// Funções auxiliares para mostrar toasts
export const showToast = {
  success: (message: string, description?: string) => {
    toast.custom(
      (t) => (
        <ToastItem
          t={t}
          type="success"
          title={message}
          description={description}
        />
      ),
      { duration: 5000 }
    );
  },
  error: (message: string, description?: string) => {
    toast.custom(
      (t) => (
        <ToastItem
          t={t}
          type="error"
          title={message}
          description={description}
        />
      ),
      { duration: 7000 }
    );
  },
  warning: (message: string, description?: string) => {
    toast.custom(
      (t) => (
        <ToastItem
          t={t}
          type="warning"
          title={message}
          description={description}
        />
      ),
      { duration: 6000 }
    );
  },
  info: (message: string, description?: string) => {
    toast.custom(
      (t) => (
        <ToastItem
          t={t}
          type="info"
          title={message}
          description={description}
        />
      ),
      { duration: 5000 }
    );
  },
};

interface ToastItemProps {
  t: Toast;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

function ToastItem({ t, type, title, description }: ToastItemProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const gradients = {
    success: "from-emerald-500/10 to-teal-500/10 border-emerald-200/50",
    error: "from-red-500/10 to-rose-500/10 border-red-200/50",
    warning: "from-amber-500/10 to-orange-500/10 border-amber-200/50",
    info: "from-blue-500/10 to-sky-500/10 border-blue-200/50",
  };

  return (
    <div
      className={cn(
        "relative bg-gradient-to-r backdrop-blur-xl rounded-xl border shadow-lg overflow-hidden min-w-[300px] max-w-[400px]",
        gradients[type],
        t.visible ? "animate-slide-up" : "animate-slide-down"
      )}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {icons[type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h4>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        
        <button
          onClick={() => toast.dismiss(t.id)}
          className="shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className={cn(
            "h-full transition-all",
            type === "success" && "bg-gradient-to-r from-emerald-500 to-teal-500",
            type === "error" && "bg-gradient-to-r from-red-500 to-rose-500",
            type === "warning" && "bg-gradient-to-r from-amber-500 to-orange-500",
            type === "info" && "bg-gradient-to-r from-blue-500 to-sky-500"
          )}
          style={{
            width: t.visible ? '100%' : '0%',
            transition: 'width 5s linear',
          }}
        />
      </div>
    </div>
  );
}