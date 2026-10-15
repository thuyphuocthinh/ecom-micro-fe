import { useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Button, TextField, Tag } from "@ecom/ui";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";
import { getUserDisplayName, getUserInitial } from "@/utils/user.ts";
import { Icon } from "@/components/common/Icon.tsx";
import { updateProfileSchema, type UpdateProfileFormData } from "./schemas.ts";
import { useUpdateProfileMutation } from "@/features/profile/hooks/useUpdateProfileMutation.ts";
import { useUploadAvatarMutation } from "@/features/profile/hooks/useUploadAvatarMutation.ts";
import { useRemoveAvatarMutation } from "@/features/profile/hooks/useRemoveAvatarMutation.ts";
import { AvatarCropModal } from "./AvatarCropModal.tsx";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_RAW_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function ProfileInfoCard() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const updateProfileMutation = useUpdateProfileMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const removeAvatarMutation = useRemoveAvatarMutation();

  const displayName = getUserDisplayName(user);
  const initial = getUserInitial(user);
  const email = user?.email || "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onTouched",
    values: {
      displayName: user?.displayName || "",
    },
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    await updateProfileMutation.mutateAsync({ displayName: data.displayName });
    reset({ displayName: data.displayName });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_RAW_SIZE_BYTES) {
      toast.error("Dung lượng ảnh tối đa 10 MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setCropFile(file);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = async (blob: Blob) => {
    try {
      await uploadAvatarMutation.mutateAsync(blob);
      setIsCropModalOpen(false);
      setCropFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      // Error is caught by api.onError / toast
    }
  };

  const handleRemoveAvatar = async () => {
    await removeAvatarMutation.mutateAsync();
  };

  const formattedJoinDate = user?.createdAt
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(user.createdAt))
    : null;

  return (
    <>
      <section aria-labelledby="info-title">
        <Card className="p-6 sm:p-8 flex flex-col gap-6 bg-white">
          {/* Card Header matching ecom-storefront.html */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line">
            <h2
              id="info-title"
              className="text-[22px] font-bold text-ink flex items-center gap-3"
            >
              <span
                className="size-11 rounded-[12px] bg-[#eaf0ff] text-brand-dark inline-flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Icon name="user" size={24} />
              </span>
              <span>Thông tin cá nhân</span>
            </h2>

            {/* Badges for Role, Join date, Auth type */}
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="brand">
                {user?.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
              </Tag>
              {user?.googleLinked ? (
                <Tag tone="ok">Đã liên kết Google</Tag>
              ) : (
                <Tag tone="warn">Đăng nhập bằng mật khẩu</Tag>
              )}
              {formattedJoinDate && (
                <span className="text-xs text-muted">
                  Tham gia từ {formattedJoinDate}
                </span>
              )}
            </div>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl bg-canvas border border-line">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="size-20 rounded-full object-cover shrink-0 border-2 border-white shadow-sm"
              />
            ) : (
              <span
                aria-hidden="true"
                className="size-20 rounded-full bg-brand text-white inline-flex items-center justify-center text-3xl font-bold font-head shrink-0 shadow-sm"
              >
                {initial}
              </span>
            )}

            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-label="Tải lên ảnh đại diện mới"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isPending}
                >
                  <Icon name="camera" size={18} />
                  <span>Chọn ảnh mới</span>
                </Button>

                {user?.avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={handleRemoveAvatar}
                    loading={removeAvatarMutation.isPending}
                    className="text-err hover:bg-err/10 hover:text-err"
                  >
                    Xóa ảnh
                  </Button>
                )}
              </div>
              <p className="text-[13px] text-muted">
                Hỗ trợ ảnh JPEG, PNG, WebP tối đa 10 MB. Bạn có thể kéo thả và
                căn chỉnh vị trí trước khi lưu.
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField
                label="Họ và tên"
                autoComplete="name"
                error={errors.displayName?.message}
                {...register("displayName")}
              />

              {/* Email (Readonly) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="readonly-email"
                  className="text-sm font-semibold text-ink"
                >
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="readonly-email"
                    type="email"
                    readOnly
                    value={email}
                    className="flex-1 min-h-[46px] px-3.5 rounded-control border border-field-border bg-[#f6f7f9] text-[15px] font-normal text-muted cursor-not-allowed select-all"
                  />
                  <Tag tone="ok" className="shrink-0">
                    <Icon name="check" size={14} />
                    <span>Đã xác minh</span>
                  </Tag>
                </div>
                <p className="text-[13px] text-muted">
                  Email dùng để đăng nhập nên không đổi ở đây.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={updateProfileMutation.isPending || isSubmitting}
                disabled={
                  !isDirty || updateProfileMutation.isPending || isSubmitting
                }
              >
                Lưu thay đổi
              </Button>

              {isDirty && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => reset()}
                    disabled={updateProfileMutation.isPending || isSubmitting}
                  >
                    Bỏ thay đổi
                  </Button>
                  <span className="text-[13px] text-muted">
                    Bạn có thay đổi chưa lưu.
                  </span>
                </>
              )}
            </div>
          </form>
        </Card>
      </section>

      {/* Modal for Avatar Cropping */}
      <AvatarCropModal
        open={isCropModalOpen}
        imageFile={cropFile}
        onClose={() => {
          setIsCropModalOpen(false);
          setCropFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onCropComplete={handleCropComplete}
        isUploading={uploadAvatarMutation.isPending}
      />
    </>
  );
}
