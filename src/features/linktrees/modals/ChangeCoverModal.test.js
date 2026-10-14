import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeCoverModal", () => {
  const mockTree = { id: 1, title: "Tree", cover: null };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/dummy-preview");
  });

  it("should not render when show is false or linkTree is null", () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: false, linkTree: mockTree },
    });
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    const { wrapper: wrapper2 } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: null },
    });
    expect(wrapper2.find('[data-testid="change-cover-modal"]').exists()).toBe(false);
  });

  it("should show validation error when file is not an image", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockTree },
    });

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const invalidFile = new File(["dummy"], "doc.pdf", { type: "application/pdf" });

    Object.defineProperty(fileInput.element, "files", {
      value: [invalidFile],
      configurable: true,
    });
    await fileInput.trigger("change");

    expect(errorSpy).toHaveBeenCalledWith("Pilih file gambar (JPG/PNG)!");
  });

  it("should show validation error when file size exceeds 1MB", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockTree },
    });

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const largeFile = new File([""], "large.png", { type: "image/png" });
    Object.defineProperty(largeFile, "size", { value: 2 * 1024 * 1024 });

    Object.defineProperty(fileInput.element, "files", {
      value: [largeFile],
      configurable: true,
    });
    await fileInput.trigger("change");

    expect(errorSpy).toHaveBeenCalledWith("Ukuran gambar maksimal 1MB!");
  });

  it("should ignore when no file is selected in change event", async () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockTree },
    });

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    Object.defineProperty(fileInput.element, "files", {
      value: [],
      configurable: true,
    });
    await fileInput.trigger("change");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);
  });

  it("should show error dialog when submitting without selecting file", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockTree },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Silakan pilih cover baru!");
  });

  it("should upload cover and call onClose on successful upload", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ChangeCoverModal, {
      props: {
        show: true,
        linkTree: mockTree,
        onClose: closeSpy,
      },
      preloadedState: {
        isLinkTreeChangeCover: false,
        isLinkTreeChangedCover: false,
      },
    });

    const asyncUploadSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeChangeCover")
      .mockReturnValue(Promise.resolve());

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const validFile = new File(["valid"], "cover.jpg", { type: "image/jpeg" });
    Object.defineProperty(validFile, "size", { value: 500 * 1024 });

    Object.defineProperty(fileInput.element, "files", {
      value: [validFile],
      configurable: true,
    });
    await fileInput.trigger("change");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(asyncUploadSpy).toHaveBeenCalledWith(1, validFile);

    // Simulate completion
    linkTreesStore.setIsLinkTreeChangeCover(true);
    linkTreesStore.setIsLinkTreeChangedCover(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle isLinkTreeChangeCover true when isLinkTreeChangedCover is false", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockTree },
      preloadedState: {
        isLinkTreeChangeCover: false,
        isLinkTreeChangedCover: false,
      },
    });

    linkTreesStore.setIsLinkTreeChangeCover(true);
    linkTreesStore.setIsLinkTreeChangedCover(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);
  });

  it("should close modal when close or cancel button clicked", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: {
        show: true,
        linkTree: mockTree,
        onClose: closeSpy,
      },
    });

    const closeBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-cover-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle close without onClose callback", async () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: {
        show: true,
        linkTree: mockTree,
      },
    });

    const closeBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.exists()).toBe(true);
  });
});
