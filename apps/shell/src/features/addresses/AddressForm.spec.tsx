import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@ecom/api";
import { AddressForm } from "./AddressForm.tsx";
import type { Address } from "@/types";

const mockProvinces = [
  { code: "01", name: "Hà Nội", fullName: "Thành phố Hà Nội" },
  { code: "79", name: "Hồ Chí Minh", fullName: "Thành phố Hồ Chí Minh" },
];

const mockHanoiWards = [
  { code: "00001", name: "Phúc Xá", fullName: "Phường Phúc Xá" },
  { code: "00004", name: "Trúc Bạch", fullName: "Phường Trúc Bạch" },
];

const mockExistingAddress: Address = {
  id: "addr-1",
  recipientName: "Nguyễn Văn A",
  phone: "0901234567",
  provinceCode: "01",
  provinceName: "Thành phố Hà Nội",
  wardCode: "00001",
  wardName: "Phường Phúc Xá",
  street: "Số 123 Đường Láng",
  label: "Nhà",
  isDefault: true,
  createdAt: "2026-10-14T10:00:00.000Z",
  updatedAt: "2026-10-14T10:00:00.000Z",
};

function renderAddressForm(props?: {
  initialData?: Address | null;
  onSubmitSuccess?: () => void;
  onClose?: () => void;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const onSubmitSuccess = props?.onSubmitSuccess ?? vi.fn();
  const onClose = props?.onClose ?? vi.fn();

  const renderResult = render(
    <QueryClientProvider client={queryClient}>
      <AddressForm
        initialData={props?.initialData}
        onSubmitSuccess={onSubmitSuccess}
        onClose={onClose}
      />
    </QueryClientProvider>,
  );

  return { ...renderResult, onSubmitSuccess, onClose };
}

describe("AddressForm (AC-5, AC-6, AC-7, AC-8, AC-9, AC-12)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(api, "get").mockImplementation(
      async (url: string, config?: unknown) => {
        if (url === "/locations/provinces") {
          return { data: mockProvinces } as never;
        }
        const params = (config as { params?: { code?: string } })?.params;
        if (
          url === "/locations/provinces/{code}/wards" ||
          url === "/locations/provinces/01/wards"
        ) {
          if (!params || params.code === "01") {
            return { data: mockHanoiWards } as never;
          }
        }
        return { data: [] } as never;
      },
    );
  });

  it("renders 'Địa chỉ mới' in create mode with empty fields and disabled ward select (AC-5, AC-6)", async () => {
    renderAddressForm();

    expect(
      screen.getByRole("heading", { name: "Địa chỉ mới" }),
    ).toBeInTheDocument();

    // Province dropdown should load provinces
    await waitFor(() => {
      expect(screen.getByText("Chọn tỉnh, thành phố")).toBeInTheDocument();
    });

    // Ward dropdown should be disabled when province is not yet selected
    const wardBtn = screen.getByRole("button", { name: /phường, xã/i });
    expect(wardBtn).toBeDisabled();
  });

  it("loads wards and enables ward select when a province is chosen (AC-6)", async () => {
    const user = userEvent.setup();
    renderAddressForm();

    await waitFor(() => {
      expect(screen.getByText("Chọn tỉnh, thành phố")).toBeInTheDocument();
    });

    const provinceBtn = screen.getByRole("button", {
      name: /tỉnh, thành phố/i,
    });
    await user.click(provinceBtn);

    const hanoiOption = screen.getByRole("option", {
      name: "Thành phố Hà Nội",
    });
    await user.click(hanoiOption);

    await waitFor(() => {
      const wardBtn = screen.getByRole("button", { name: /phường, xã/i });
      expect(wardBtn).not.toBeDisabled();
    });
  });

  it("shows validation errors when submitting an empty form (AC-7)", async () => {
    const user = userEvent.setup();
    renderAddressForm();

    const submitBtn = screen.getByRole("button", { name: "Lưu địa chỉ" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Vui lòng nhập họ và tên người nhận"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Vui lòng nhập số điện thoại"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Vui lòng chọn tỉnh, thành phố"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Vui lòng nhập số nhà, tên đường"),
      ).toBeInTheDocument();
    });
  });

  it("submits POST /users/me/addresses and calls onSubmitSuccess in create mode (AC-8)", async () => {
    const user = userEvent.setup();
    const postSpy = vi.spyOn(api, "post").mockResolvedValueOnce({
      data: { ...mockExistingAddress, id: "addr-new" },
    } as never);

    const { onSubmitSuccess } = renderAddressForm();

    await waitFor(() => {
      expect(screen.getByText("Chọn tỉnh, thành phố")).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText("Họ và tên người nhận"),
      "Trần Thị Lan",
    );
    await user.type(screen.getByLabelText("Số điện thoại"), "0912345678");

    const provinceBtn = screen.getByRole("button", {
      name: /tỉnh, thành phố/i,
    });
    await user.click(provinceBtn);

    const hanoiOption = screen.getByRole("option", {
      name: "Thành phố Hà Nội",
    });
    await user.click(hanoiOption);

    await waitFor(() => {
      const wardBtn = screen.getByRole("button", { name: /phường, xã/i });
      expect(wardBtn).not.toBeDisabled();
    });

    const wardBtn = screen.getByRole("button", { name: /phường, xã/i });
    await user.click(wardBtn);

    const phucXaOption = screen.getByRole("option", {
      name: "Phường Phúc Xá",
    });
    await user.click(phucXaOption);

    await user.type(
      screen.getByLabelText("Số nhà, tên đường"),
      "Số 10 Phố Huế",
    );
    await user.type(
      screen.getByLabelText("Tên gợi nhớ (không bắt buộc)"),
      "Cơ quan",
    );

    const submitBtn = screen.getByRole("button", { name: "Lưu địa chỉ" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith("/users/me/addresses", {
        body: {
          recipientName: "Trần Thị Lan",
          phone: "0912345678",
          wardCode: "00001",
          street: "Số 10 Phố Huế",
          label: "Cơ quan",
          isDefault: false,
        },
      });
      expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("renders 'Sửa địa chỉ' in edit mode and submits PATCH without isDefault (AC-5, AC-9)", async () => {
    const user = userEvent.setup();
    const patchSpy = vi.spyOn(api, "patch").mockResolvedValueOnce({
      data: { ...mockExistingAddress, recipientName: "Nguyễn Văn B" },
    } as never);

    const { onSubmitSuccess } = renderAddressForm({
      initialData: mockExistingAddress,
    });

    expect(
      screen.getByRole("heading", { name: "Sửa địa chỉ" }),
    ).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Họ và tên người nhận");
    expect(nameInput).toHaveValue("Nguyễn Văn A");

    await user.clear(nameInput);
    await user.type(nameInput, "Nguyễn Văn B");

    const submitBtn = screen.getByRole("button", { name: "Lưu địa chỉ" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith("/users/me/addresses/{id}", {
        params: { id: "addr-1" },
        body: {
          recipientName: "Nguyễn Văn B",
          phone: "0901234567",
          wardCode: "00001",
          street: "Số 123 Đường Láng",
          label: "Nhà",
        },
      });
      expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("calls onClose when Huỷ button is clicked (AC-5)", async () => {
    const user = userEvent.setup();
    const { onClose } = renderAddressForm();

    const cancelBtn = screen.getByRole("button", { name: "Huỷ" });
    await user.click(cancelBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
