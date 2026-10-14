import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Spinner } from "@ecom/ui";
import { useGoogleLoginMutation } from "@/hooks/mutations/useGoogleLoginMutation.ts";
import { sanitizeReturnTo } from "@/utils/redirect.ts";
import {
  getGoogleClientId,
  loadGoogleScript,
  type GoogleCredentialResponse,
} from "@/utils/google-auth.ts";

export interface GoogleAuthButtonProps {
  returnTo?: string | null;
  context?: "signin" | "signup";
}

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
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
            callback: async (response: GoogleCredentialResponse) => {
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
                // Backend error is handled centrally via api.onError
              }
            },
            context: context === "signup" ? "signup" : "signin",
          });

          window.google.accounts.id.renderButton(containerRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: context === "signup" ? "signup_with" : "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: "100%",
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
  }, [context, googleLoginMutation, navigate, returnTo]);

  if (status === "missing_client_id") {
    return (
      <button
        type="button"
        data-testid="google-auth-button"
        onClick={() => {
          toast.error("Chưa cấu hình Google Client ID trên hệ thống.");
        }}
        className="w-full h-11 flex items-center justify-center gap-3 px-4 border border-line rounded-lg text-ink font-medium bg-surface hover:bg-surface-2 transition-colors cursor-pointer text-sm"
      >
        <GoogleIcon />
        <span>Tiếp tục với Google</span>
      </button>
    );
  }

  if (status === "error") {
    return (
      <button
        type="button"
        data-testid="google-auth-button"
        onClick={() => {
          toast.error("Không thể tải Google Sign-In. Vui lòng thử lại sau.");
        }}
        className="w-full h-11 flex items-center justify-center gap-3 px-4 border border-line rounded-lg text-ink font-medium bg-surface hover:bg-surface-2 transition-colors cursor-pointer text-sm"
      >
        <GoogleIcon />
        <span>Tiếp tục với Google</span>
      </button>
    );
  }

  return (
    <div className="w-full relative">
      {status === "loading" && (
        <div
          data-testid="google-auth-loading"
          className="w-full h-11 flex items-center justify-center gap-3 px-4 border border-line rounded-lg bg-surface-2 animate-pulse text-sm text-ink-3"
        >
          <GoogleIcon />
          <span>Đang tải Google…</span>
        </div>
      )}

      {googleLoginMutation.isPending && (
        <div
          data-testid="google-auth-submitting"
          className="w-full h-11 flex items-center justify-center gap-2 px-4 border border-line rounded-lg bg-surface-2 text-sm text-ink-2"
        >
          <Spinner />
          <span>Đang đăng nhập bằng Google…</span>
        </div>
      )}

      <div
        ref={containerRef}
        data-testid="google-auth-container"
        className={`w-full flex justify-center min-h-[44px] ${
          status !== "ready" || googleLoginMutation.isPending ? "hidden" : ""
        }`}
      />
    </div>
  );
}
