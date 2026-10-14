import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";
import { linkTreesStore } from "../states/linkTreesStore";

describe("HomePage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockTrees = [
    {
      id: 1,
      user_id: 1,
      title: "Tree Pertama",
      description: "Deskripsi pertama",
      type: "public",
      cover: "https://example.com/cover1.jpg",
      created_at: "2024-02-26T02:34:26.000000Z",
      author: { name: "Abdullah", photo: "https://example.com/photo.jpg" },
      total_links: 3,
    },
    {
      id: 2,
      user_id: 2,
      title: "Tree Kedua Unlisted",
      description: "Deskripsi kedua",
      type: "unlisted",
      cover: null,
      created_at: "2024-02-26T02:34:26.000000Z",
      author: { name: "Ubaid", photo: null },
      total_links: 1,
    },
    {
      id: 3,
      user_id: 3,
      title: "Tree Ketiga Privat",
      description: "Deskripsi ketiga",
      type: "private",
      cover: null,
      created_at: "2024-02-26T02:34:26.000000Z",
      author: null,
      total_links: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockImplementation(() =>
      Promise.resolve()
    );
  });

  it("should return null/empty if profile is not present", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: null },
    });
    expect(wrapper.find('[data-testid="add-linktree-btn"]').exists()).toBe(false);
  });

  it("should render link trees stats, rows, and empty state when empty", async () => {
    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockResolvedValue();

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [],
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Daftar Link Tree");
    expect(wrapper.text()).toContain("Belum ada data link tree yang cocok.");
  });

  it("should display loading indicator while loading link trees", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [],
      },
    });

    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockReturnValue(
      new Promise(() => {})
    );
    const filterMineBtn = wrapper.find('[data-testid="filter-mine-btn"]');
    await filterMineBtn.trigger("click");

    expect(wrapper.text()).toContain("Memuat daftar link tree...");
  });

  it("should display stats count and filter/search link trees", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Total Link Tree");
    expect(wrapper.text()).toContain("Tree Pertama");
    expect(wrapper.text()).toContain("Tree Kedua Unlisted");
    expect(wrapper.text()).toContain("Tree Ketiga Privat");

    // Search by title
    const searchInput = wrapper.find('[data-testid="search-linktree-input"]');
    await searchInput.setValue("Pertama");
    expect(wrapper.text()).toContain("Tree Pertama");
    expect(wrapper.text()).not.toContain("Tree Kedua Unlisted");

    // Search by description
    await searchInput.setValue("kedua");
    expect(wrapper.text()).toContain("Tree Kedua Unlisted");

    // Test filter buttons
    const filterMineBtn = wrapper.find('[data-testid="filter-mine-btn"]');
    await filterMineBtn.trigger("click");

    const filterAllBtn = wrapper.find('[data-testid="filter-all-btn"]');
    await filterAllBtn.trigger("click");
  });

  it("should handle search against link trees with null title and description", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [{ id: 99, title: null, description: null, type: "public" }],
      },
    });
    await new Promise((r) => setTimeout(r, 20));

    const searchInput = wrapper.find('[data-testid="search-linktree-input"]');
    await searchInput.setValue("xyz");
    expect(wrapper.text()).toContain("Belum ada data link tree yang cocok.");
  });

  it("should open and close AddModal when Tambah Link Tree button clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const addBtn = wrapper.find('[data-testid="add-linktree-btn"]');
    await addBtn.trigger("click");

    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(false);
  });

  it("should navigate to detail page when view icon clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    navSpy.mockClear();
    await new Promise((r) => setTimeout(r, 20));

    const viewBtn = wrapper.find('[data-testid="view-linktree-1"]');
    await viewBtn.trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/link-trees/1");
  });

  it("should open and close edit modal when edit icon clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const editBtn = wrapper.find('[data-testid="edit-linktree-1"]');
    await editBtn.trigger("click");

    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
  });

  it("should trigger confirm dialog and dispatch delete when delete icon confirmed", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteActionSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: true,
    });

    const deleteBtn = wrapper.find('[data-testid="delete-linktree-1"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteActionSpy).toHaveBeenCalledWith(1);
  });

  it("should not dispatch delete when cancelled", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteActionSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: false,
    });

    const deleteBtn = wrapper.find('[data-testid="delete-linktree-1"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(toolsHelper.showConfirmDialog).toHaveBeenCalled();
    expect(deleteActionSpy).not.toHaveBeenCalled();
  });

  it("should trigger confirm dialog and dispatch delete all when confirmed", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteAllSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreesDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: true,
    });

    const deleteAllBtn = wrapper.find(
      '[data-testid="delete-all-linktrees-btn"]'
    );
    await deleteAllBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("should not dispatch delete all when cancelled", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const deleteAllSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreesDelete")
      .mockReturnValue(Promise.resolve());

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({
      isConfirmed: false,
    });

    const deleteAllBtn = wrapper.find(
      '[data-testid="delete-all-linktrees-btn"]'
    );
    await deleteAllBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    expect(deleteAllSpy).not.toHaveBeenCalled();
  });

  it("should reload link trees when isLinkTreeDeleted or isLinkTreesDeleted is true", async () => {
    const { linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: mockTrees,
        isLinkTreeDeleted: false,
        isLinkTreesDeleted: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const asyncSetSpy = vi
      .spyOn(linkTreesStore, "asyncSetLinkTrees")
      .mockReturnValue(Promise.resolve());

    linkTreesStore.setIsLinkTreeDeleted(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(asyncSetSpy).toHaveBeenCalled();

    asyncSetSpy.mockClear();
    linkTreesStore.setIsLinkTreesDeleted(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(asyncSetSpy).toHaveBeenCalled();
  });

  it("should not update loading state after unmount", async () => {
    let resolveLoad;
    const pendingPromise = new Promise((resolve) => {
      resolveLoad = resolve;
    });

    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: [] },
    });

    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockReturnValue(pendingPromise);

    const filterMineBtn = wrapper.find('[data-testid="filter-mine-btn"]');
    await filterMineBtn.trigger("click");

    wrapper.unmount();
    resolveLoad();
    await pendingPromise;
  });

  it("should handle null linkTrees store gracefully", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: null,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Belum ada data link tree");
  });
});
