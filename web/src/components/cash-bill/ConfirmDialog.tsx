import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type Variant = 'info' | 'success' | 'warning' | 'danger';

interface Props {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles: Record<Variant, { icon: any; iconBg: string; iconColor: string; confirmBg: string }> = {
  info: { icon: Info, iconBg: 'bg-info-50', iconColor: 'text-info-500', confirmBg: 'bg-primary-500 hover:bg-primary-600' },
  success: { icon: CheckCircle2, iconBg: 'bg-accent-50', iconColor: 'text-accent-500', confirmBg: 'bg-accent-500 hover:bg-accent-600' },
  warning: { icon: AlertTriangle, iconBg: 'bg-secondary-50', iconColor: 'text-secondary-500', confirmBg: 'bg-secondary-500 hover:bg-secondary-600' },
  danger: { icon: AlertTriangle, iconBg: 'bg-danger-50', iconColor: 'text-danger-500', confirmBg: 'bg-danger-500 hover:bg-danger-600' },
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          <X size={16} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${style.iconBg}`}>
            <Icon size={24} className={style.iconColor} />
          </div>

          {/* Title + Message */}
          <h3 className="text-base font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
            {title}
          </h3>
          <div className="text-sm leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
            {message}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-50 ${style.confirmBg}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
