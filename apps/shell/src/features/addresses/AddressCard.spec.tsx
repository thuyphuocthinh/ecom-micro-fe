import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressCard } from "./AddressCard.tsx";
import type { Address } from "@/types";

const mockDefaultAddress: Address = {
  id: "addr-1",
  recipientName: "Nguyễn Văn A",
  phone: "0901234567",
  provinceCode: "01",
  provinceName: "Thành phố Hà Nội",
  wardCode: "00001",
  wardName: "Phường Phúc Xá",
  street: "Số 123 Đường Láng",
  label: "Nhà riêng",
  isDefault: true,
  createdAt: "2026-10-14T10:00:00.000Z",
  updatedAt: "2026-10-14T10:00:00.000Z",
};

const mockSecondaryAddress: Address = {
  id: "addr-2",
  recipientName: "Trần Thị B",
  phone: "0987654321",
  provinceCode: "79",
  provinceName: "Thành phố Hồ Chí Minh",
  wardCode: "26734",
  wardName: "Phường Bến Nghé",
  street: "Số 456 Lê Lợi",
  label: null,
  isDefault: false,
  createdAt: "2026-10-14T10:00:00.000Z",
  updatedAt: "2026-10-14T10:00:00.000Z",
};

describe("AddressCard (AC-2, AC-10, AC-11)", () => {
  it("renders address information, label and default badge when isDefault is true", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onSetDefault = vi.fn();

    render(
      <AddressCard
        address={mockDefaultAddress}
        onEdit={onEdit}
        onDelete={onDelete}
        onSetDefault={onSetDefault}
      />,
    );

    expect(screen.getByText("Nhà riêng")).toBeInTheDocument();
    expect(screen.getByText("Mặc định")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("0901234567")).toBeInTheDocument();
    expect(
      screen.getByText("Số 123 Đường Láng, Phường Phúc Xá, Thành phố Hà Nội"),
    ).toBeInTheDocument();

    // Default address should not have "Đặt làm mặc định" button
    expect(
      screen.queryByRole("button", { name: /đặt làm mặc định/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sửa/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /xoá/i })).toBeInTheDocument();
  });

  it("renders fallback label 'Địa chỉ' and 'Đặt làm mặc định' button when isDefault is false", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onSetDefault = vi.fn();

    render(
      <AddressCard
        address={mockSecondaryAddress}
        onEdit={onEdit}
        onDelete={onDelete}
        onSetDefault={onSetDefault}
      />,
    );

    expect(screen.getByText("Địa chỉ")).toBeInTheDocument();
    expect(screen.queryByText("Mặc định")).not.toBeInTheDocument();

    const setDefaultBtn = screen.getByRole("button", {
      name: /đặt địa chỉ làm mặc định/i,
    });
    expect(setDefaultBtn).toBeInTheDocument();

    await user.click(setDefaultBtn);
    expect(onSetDefault).toHaveBeenCalledTimes(1);
    expect(onSetDefault).toHaveBeenCalledWith("addr-2");
  });

  it("calls onEdit when Sửa button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onSetDefault = vi.fn();

    render(
      <AddressCard
        address={mockDefaultAddress}
        onEdit={onEdit}
        onDelete={onDelete}
        onSetDefault={onSetDefault}
      />,
    );

    const editBtn = screen.getByRole("button", {
      name: /sửa địa chỉ nhà riêng/i,
    });
    await user.click(editBtn);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(mockDefaultAddress);
  });

  it("calls onDelete when Xoá button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onSetDefault = vi.fn();

    render(
      <AddressCard
        address={mockDefaultAddress}
        onEdit={onEdit}
        onDelete={onDelete}
        onSetDefault={onSetDefault}
      />,
    );

    const deleteBtn = screen.getByRole("button", {
      name: /xoá địa chỉ nhà riêng/i,
    });
    await user.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(mockDefaultAddress);
  });

  it("disables 'Đặt làm mặc định' button when isSettingDefault is true", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onSetDefault = vi.fn();

    render(
      <AddressCard
        address={mockSecondaryAddress}
        onEdit={onEdit}
        onDelete={onDelete}
        onSetDefault={onSetDefault}
        isSettingDefault={true}
      />,
    );

    const setDefaultBtn = screen.getByRole("button", {
      name: /đặt địa chỉ làm mặc định/i,
    });
    expect(setDefaultBtn).toBeDisabled();
  });
});
