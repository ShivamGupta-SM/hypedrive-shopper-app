import { ExclamationCircleIcon } from "@heroicons/react/16/solid";

interface FormErrorProps {
  message: string | null | undefined;
  className?: string;
}

/**
 * Reusable form error display component
 * Used in login, register, and other forms for consistent error UI
 */
export function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={`mb-6 flex items-start gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-950/30 ${className}`}
    >
      <ExclamationCircleIcon className="mt-0.5 size-5 shrink-0 text-red-500" />
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}
