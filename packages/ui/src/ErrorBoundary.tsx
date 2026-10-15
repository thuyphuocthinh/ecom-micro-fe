import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";

export interface ErrorFallbackProps {
  error?: Error | unknown;
  resetErrorBoundary?: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = "Đã xảy ra lỗi không mong muốn",
  description = "Ứng dụng gặp sự cố trong quá trình xử lý. Vui lòng thử tải lại trang hoặc quay về trang chủ.",
}: ErrorFallbackProps) {
  const errorMessage =
    error instanceof Error ? error.message : String(error || "");

  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <div
      role="alert"
      className="flex min-h-[360px] flex-col items-center justify-center p-6 sm:p-10 text-center"
    >
      <div className="size-16 rounded-full bg-sale-tint flex items-center justify-center text-sale mb-4 shadow-sm">
        <Icon name="x-circle" size={36} strokeWidth={2} />
      </div>

      <h2 className="font-head text-2xl font-bold text-ink mb-2">{title}</h2>

      <p className="text-sm text-ink-2 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Button variant="primary" size="md" onClick={handleReload}>
          Tải lại trang
        </Button>
        <Button variant="secondary" size="md" onClick={handleGoHome}>
          Về trang chủ
        </Button>
      </div>

      {Boolean(errorMessage) && (
        <details className="mt-6 text-left max-w-lg w-full bg-surface-sunken border border-line p-3.5 rounded-xl text-xs text-ink-2 font-mono overflow-auto max-h-48">
          <summary className="cursor-pointer font-semibold mb-1.5 text-ink select-none">
            Chi tiết kỹ thuật (Developer Info)
          </summary>
          <pre className="whitespace-pre-wrap break-all">{errorMessage}</pre>
        </details>
      )}
    </div>
  );
}

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onCatch?: (error: Error, errorInfo: ErrorInfo) => void;
  title?: string;
  description?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  override state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onCatch?.(error, errorInfo);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error, this.reset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.reset}
          title={this.props.title}
          description={this.props.description}
        />
      );
    }

    return this.props.children;
  }
}
