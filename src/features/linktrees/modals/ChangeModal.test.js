import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import linkTreeApi from "../api/linkTreeApi";

describe("ChangeModal", () => {
  const mockTree = {
    id: 1,
    title: "Link Tree Judul",
    type: "public",
    description: "Deskripsi Asli",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: false, linkTreeId: 1 },
    });
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
  });

  it("should fetch and load link tree data on open", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockTree);

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const titleInput = wrapper.find('[data-testid="edit-linktree-title-input"]');
    expect(titleInput.element.value).toBe("Link Tree Judul");

    const typeSelect = wrapper.find('[data-testid="edit-linktree-type-select"]');
    expect(typeSelect.element.value).toBe("public");
  });

  it("should handle error when fetching link tree data fails", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const closeSpy = vi.fn();
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("Err"));

    renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(errorSpy).toHaveBeenCalledWith("Gagal mengambil data link tree");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should show validation error if title is empty", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({
      ...mockTree,
      title: "",
    });
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });
    await new Promise((r) => setTimeout(r, 20));

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");
  });

  it("should show validation error if type is empty", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockTree);
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });
    await new Promise((r) => setTimeout(r, 20));

    const typeSelect = wrapper.find('[data-testid="edit-linktree-type-select"]');
    await typeSelect.setValue("");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Tipe tidak boleh kosong");
  });

  it("should show validation error if description is empty", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({
      ...mockTree,
      description: "",
    });
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });
    await new Promise((r) => setTimeout(r, 20));

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should dispatch asyncSetIsLinkTreeChange and call onClose on successful change", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockTree);
    const closeSpy = vi.fn();

    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        linkTreeId: 1,
        onClose: closeSpy,
      },
      preloadedState: {
        isLinkTreeChange: false,
        isLinkTreeChanged: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const asyncChangeSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeChange")
      .mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="edit-linktree-title-input"]');
    const descInput = wrapper.find('[data-testid="edit-linktree-description-input"]');

    await titleInput.setValue("Judul Diperbarui");
    await descInput.setValue("Deskripsi Diperbarui");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(asyncChangeSpy).toHaveBeenCalledWith(
      1,
      "Judul Diperbarui",
      "public",
      "Deskripsi Diperbarui"
    );

    // Simulate completion from store
    linkTreesStore.setIsLinkTreeChange(true);
    linkTreesStore.setIsLinkTreeChanged(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle isLinkTreeChange true when isLinkTreeChanged is false", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockTree);

    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
      preloadedState: {
        isLinkTreeChange: false,
        isLinkTreeChanged: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    linkTreesStore.setIsLinkTreeChange(true);
    linkTreesStore.setIsLinkTreeChanged(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);
  });

  it("should close modal when close or cancel button clicked", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockTree);
    const closeSpy = vi.fn();

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        linkTreeId: 1,
        onClose: closeSpy,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-edit-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle null tree and tree with null fields from getLinkTreeById", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(null);

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });
    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.exists()).toBe(true);

    // Tree with null properties
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({
      id: 1,
      title: null,
      type: null,
      description: null,
    });

    const { wrapper: wrapper2 } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });
    await new Promise((r) => setTimeout(r, 20));

    const closeBtn = wrapper2.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper2.exists()).toBe(true);
  });
});
