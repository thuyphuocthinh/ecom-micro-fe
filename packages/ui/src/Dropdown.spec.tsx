import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropdown } from "./Dropdown.tsx";

const options = [
  { value: "01", label: "Thành phố Hà Nội" },
  { value: "79", label: "Thành phố Hồ Chí Minh" },
  { value: "48", label: "Thành phố Đà Nẵng" },
];

describe("Dropdown component", () => {
  it("renders placeholder when value is empty", () => {
    render(
      <Dropdown
        label="Tỉnh, thành phố"
        options={options}
        value=""
        placeholder="Chọn tỉnh, thành"
      />,
    );

    expect(screen.getByText("Chọn tỉnh, thành")).toBeInTheDocument();
  });

  it("renders selected option label when value matches an option", () => {
    render(<Dropdown label="Tỉnh, thành phố" options={options} value="01" />);

    expect(screen.getByText("Thành phố Hà Nội")).toBeInTheDocument();
  });

  it("opens popover on click and calls onChange when an option is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Dropdown
        label="Tỉnh, thành phố"
        options={options}
        value=""
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("button");
    await user.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    const hcmOption = screen.getByRole("option", {
      name: /thành phố hồ chí minh/i,
    });
    await user.click(hcmOption);

    expect(onChange).toHaveBeenCalledWith("79");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters options by keyword when searchable is true", async () => {
    const user = userEvent.setup();

    render(
      <Dropdown
        label="Tỉnh, thành phố"
        options={options}
        value=""
        searchable={true}
        searchPlaceholder="Tìm kiếm tỉnh thành..."
      />,
    );

    await user.click(screen.getByRole("button"));

    const searchInput = screen.getByPlaceholderText("Tìm kiếm tỉnh thành...");
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, "Đà Nẵng");

    expect(
      screen.getByRole("option", { name: /thành phố đà nẵng/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /thành phố hà nội/i }),
    ).not.toBeInTheDocument();
  });

  it("shows empty message when search query does not match any option", async () => {
    const user = userEvent.setup();

    render(
      <Dropdown
        label="Tỉnh, thành phố"
        options={options}
        value=""
        searchable={true}
      />,
    );

    await user.click(screen.getByRole("button"));

    const searchInput = screen.getByPlaceholderText("Tìm kiếm...");
    await user.type(searchInput, "Không tồn tại");

    expect(screen.getByText("Không tìm thấy kết quả")).toBeInTheDocument();
  });

  it("closes popover when Escape is pressed", async () => {
    const user = userEvent.setup();

    render(<Dropdown label="Tỉnh, thành phố" options={options} value="" />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders error message and aria-invalid when error is provided", () => {
    render(
      <Dropdown
        label="Tỉnh, thành phố"
        options={options}
        error="Vui lòng chọn tỉnh, thành phố"
      />,
    );

    expect(
      screen.getByText("Vui lòng chọn tỉnh, thành phố"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute("aria-invalid", "true");
  });
});
