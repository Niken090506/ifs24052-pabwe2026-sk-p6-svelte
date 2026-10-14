import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as router from "../../../router";
import { linkTreesStore } from "../states/linkTreesStore";

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockTree = {
    id: 1,
    title: "Detail Link Tree",
    description: "Detail Deskripsi Markdown",
    type: "public",
    cover: "https://example.com/cover.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
    author: { name: "Abdullah", photo: "https://example.com/photo.jpg" },
    items: [
      {
        id: 10,
        title: "Item 1",
        url: "https://item1.com",
      },
      {
        id: 20,
        title: "Item 2",
        url: "https://item2.com",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading spinner if profile or linkTree is missing", () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: null,
        linkTree: null,
      },
    });

    expect(wrapper.text()).not.toContain("Detail Link Tree");

    const { wrapper: wrapper2 } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
      },
    });
    expect(wrapper2.text()).not.toContain("Detail Link Tree");
  });

  it("should not call asyncSetLinkTree if linkTreeId is not provided onMount", () => {
    const spy = vi
      .spyOn(linkTreesStore, "asyncSetLinkTree")
      .mockImplementation(() => Promise.resolve());
    renderWithProviders(DetailPage, {
      props: { linkTreeId: null },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
      },
    });

    expect(spy).not.toHaveBeenCalled();
  });

  it("should render link tree details, items, and handle cover, edit, and item modals", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    expect(wrapper.text()).toContain("Detail Link Tree");
    expect(wrapper.text()).toContain("Detail Deskripsi Markdown");
    expect(wrapper.text()).toContain("Publik");
    expect(wrapper.text()).toContain("Item 1");
    expect(wrapper.text()).toContain("Item 2");

    // Back to link trees link
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const backLink = wrapper.find('[data-testid="back-to-linktrees-link"]');
    await backLink.trigger("click");
    expect(navigateSpy).toHaveBeenCalledWith("/");

    // Open & close cover modal
    const editCoverBtn = wrapper.find('[data-testid="edit-cover-btn"]');
    await editCoverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    const closeCoverBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeCoverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    // Open & close edit modal
    const editDetailBtn = wrapper.find('[data-testid="edit-detail-linktree-btn"]');
    await editDetailBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);

    const closeEditBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeEditBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);

    // Open & close item modal for Add
    const addItemBtn = wrapper.find('[data-testid="add-item-btn"]');
    await addItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);

    const closeItemBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);

    // Open item modal for Edit item
    const editItemBtn = wrapper.find('[data-testid="edit-item-10"]');
    await editItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
    await closeItemBtn.trigger("click");
  });

  it("should render badges and fallbacks for unlisted, private, and empty description/items", () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockTree,
          type: "unlisted",
          description: "",
          cover: null,
          items: [],
          author: null,
        },
      },
    });

    expect(wrapper.text()).toContain("Unlisted");
    expect(wrapper.text()).toContain("Tidak ada deskripsi rinci untuk link tree ini.");
    expect(wrapper.text()).toContain("Belum ada tautan di dalam halaman ini.");

    // Private badge
    const { wrapper: wrapperPriv } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockTree,
          type: "private",
          author: { name: "Author", photo: null },
        },
      },
    });
    expect(wrapperPriv.text()).toContain("Privat");
  });

  it("should trigger confirm dialog and dispatch delete on delete button click when confirmed", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );
    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: true,
    });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const deleteBtn = wrapper.find('[data-testid="delete-detail-linktree-btn"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should not dispatch delete when cancelled", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );
    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: false,
    });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const deleteBtn = wrapper.find('[data-testid="delete-detail-linktree-btn"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should trigger confirm dialog and dispatch delete item when confirmed", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );
    const deleteItemSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: true,
    });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const deleteItemBtn = wrapper.find('[data-testid="delete-item-10"]');
    await deleteItemBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteItemSpy).toHaveBeenCalledWith(1, 10);
  });

  it("should not dispatch delete item when cancelled", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );
    const deleteItemSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: false,
    });

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    const deleteItemBtn = wrapper.find('[data-testid="delete-item-10"]');
    await deleteItemBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteItemSpy).not.toHaveBeenCalled();
  });

  it("should navigate back to home if isLinkTree is true and linkTree is null", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { linkTreesStore: lStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
        isLinkTree: false,
      },
    });

    lStore.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should stay when isLinkTree is true and linkTree exists", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { wrapper, linkTreesStore: lStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
        isLinkTree: false,
      },
    });

    navigateSpy.mockClear();
    lStore.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Detail Link Tree");
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("should navigate back to home if isLinkTreeDeleted is true", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { linkTreesStore: lStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
        isLinkTreeDeleted: false,
      },
    });

    lStore.setIsLinkTreeDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should re-fetch link tree when isItemDeleted is true", async () => {
    const fetchSpy = vi
      .spyOn(linkTreesStore, "asyncSetLinkTree")
      .mockImplementation(() => Promise.resolve());
    const { linkTreesStore: lStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
        isItemDeleted: false,
      },
    });

    fetchSpy.mockClear();
    lStore.setIsItemDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchSpy).toHaveBeenCalledWith(1);
  });

  it("should trigger asyncSetLinkTree on linkTreeId change", async () => {
    const setTreeSpy = vi
      .spyOn(linkTreesStore, "asyncSetLinkTree")
      .mockImplementation(() => Promise.resolve());
    const { rerender } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockTree,
      },
    });

    await rerender({ linkTreeId: 2 });
    await new Promise((r) => setTimeout(r, 10));

    expect(setTreeSpy).toHaveBeenCalledWith(2);
  });

  it("should handle fallbacks for cover title, author name, null items, and null linkTreeId when isItemDeleted", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() =>
      Promise.resolve()
    );

    const { wrapper, linkTreesStore: lStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: null },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          id: 1,
          title: "",
          type: "public",
          cover: "https://example.com/cover.jpg",
          author: { name: "", photo: "https://example.com/author.jpg" },
          items: [],
        },
        isItemDeleted: false,
      },
    });

    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);

    lStore.setIsItemDeleted(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.exists()).toBe(true);
  });
});
