import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button, Spinner } from "@ecom/ui";
import { useGoogleLoginMutation } from "@/features/auth/hooks/useGoogleLoginMutation.ts";
import { sanitizeReturnTo } from "@/utils/redirect.ts";
import { Icon } from "@/components/common/Icon.tsx";
import {
  getGoogleClientId,
  loadGoogleScript,
  type GoogleCredentialResponse,
} from "@/utils/google-auth.ts";

export interface GoogleAuthButtonProps {
  returnTo?: string | null;
  context?: "signin" | "signup";
}

export function GoogleAuthButton({
  returnTo,
  context = "signin",
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "error" | "missing_client_id"
  >("loading");
  const googleLoginMutation = useGoogleLoginMutation();
  const navigate = useNavigate();

  const callbackHandlerRef = useRef<
    (res: GoogleCredentialResponse) => Promise<void>
  >(async () => {});

  useEffect(() => {
    callbackHandlerRef.current = async (response: GoogleCredentialResponse) => {
      if (!response.credential) return;

      try {
        const result = await googleLoginMutation.mutateAsync({
          idToken: response.credential,
        });

        if (result.isNewUser) {
          toast.success("Chào mừng bạn gia nhập Ecom!");
        } else {
          toast.success("Đăng nhập thành công!");
        }

        const targetPath = sanitizeReturnTo(returnTo);
        navigate(targetPath, { replace: true });
      } catch {
        // Backend error is handled centrally via api.onError (ToastHost)
      }
    };
  });

  useEffect(() => {
    let isCancelled = false;

    const initGis = async () => {
      const clientId = getGoogleClientId();
      const isTestOrMocked =
        typeof window !== "undefined" && Boolean(window.google?.accounts?.id);

      if (!clientId && !isTestOrMocked) {
        if (!isCancelled) setStatus("missing_client_id");
        return;
      }

      try {
        await loadGoogleScript();
        if (isCancelled) return;

        if (window.google?.accounts?.id && containerRef.current) {
          window.google.accounts.id.initialize({
            client_id: clientId || "test-client-id",
            callback: (res) => void callbackHandlerRef.current(res),
            context: context === "signup" ? "signup" : "signin",
          });

          const containerWidth = containerRef.current.clientWidth;
          const targetWidth =
            containerWidth > 0
              ? Math.min(400, Math.max(200, Math.floor(containerWidth)))
              : 400;

          window.google.accounts.id.renderButton(containerRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: context === "signup" ? "signup_with" : "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: targetWidth,
          });

          if (!isCancelled) setStatus("ready");
        } else {
          if (!isCancelled) setStatus("error");
        }
      } catch {
        if (!isCancelled) setStatus("error");
      }
    };

    void initGis();

    return () => {
      isCancelled = true;
    };
  }, [context]);

  if (status === "missing_client_id" || status === "error") {
    const errorMessage =
      status === "missing_client_id"
        ? "Chưa cấu hình Google Client ID trên hệ thống."
        : "Không thể tải Google Sign-In. Vui lòng thử lại sau.";

    return (
      <Button
        type="button"
        variant="secondary"
        size="md"
        data-testid="google-auth-button"
        onClick={() => toast.error(errorMessage)}
        className="w-full min-h-11 justify-center gap-3 text-sm font-medium"
      >
        <Icon name="google" size={20} />
        <span>Tiếp tục với Google</span>
      </Button>
    );
  }

  return (
    <div className="w-full relative">
      {status === "loading" && (
        <div
          data-testid="google-auth-loading"
          className="w-full min-h-11 flex items-center justify-center gap-3 px-4 border border-line rounded-control bg-surface-2 animate-pulse text-sm text-ink-3"
        >
          <Icon name="google" size={20} />
          <span>Đang tải Google…</span>
        </div>
      )}

      {googleLoginMutation.isPending && (
        <div
          data-testid="google-auth-submitting"
          className="w-full min-h-11 flex items-center justify-center gap-2 px-4 border border-line rounded-control bg-surface-2 text-sm text-ink-2"
        >
          <Spinner />
          <span>Đang đăng nhập bằng Google…</span>
        </div>
      )}

      <div
        ref={containerRef}
        data-testid="google-auth-container"
        className={`w-full flex justify-center min-h-[44px] [&>div]:!w-full [&_iframe]:!w-full [&_iframe]:!max-w-none ${
          status !== "ready" || googleLoginMutation.isPending ? "hidden" : ""
        }`}
      />
    </div>
  );
}
