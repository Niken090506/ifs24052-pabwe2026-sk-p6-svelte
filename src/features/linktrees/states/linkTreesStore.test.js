import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLinkTreesStore, linkTreesStore } from "./linkTreesStore";
import linkTreeApi from "../api/linkTreeApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("linkTreesStore", () => {
  beforeEach(() => {
    linkTreesStore.reset();
    vi.restoreAllMocks();
  });

  it("should have correct default state", () => {
    const store = useLinkTreesStore();
    expect(store.linkTrees).toEqual([]);
    expect(store.linkTree).toBeNull();
    expect(store.isLinkTree).toBe(false);
    expect(store.isLinkTreeAdd).toBe(false);
    expect(store.isLinkTreeAdded).toBe(false);
    expect(store.isLinkTreeChange).toBe(false);
    expect(store.isLinkTreeChanged).toBe(false);
    expect(store.isLinkTreeChangeCover).toBe(false);
    expect(store.isLinkTreeChangedCover).toBe(false);
    expect(store.isLinkTreeDelete).toBe(false);
    expect(store.isLinkTreeDeleted).toBe(false);
    expect(store.isLinkTreesDelete).toBe(false);
    expect(store.isLinkTreesDeleted).toBe(false);
    expect(store.isItemAdd).toBe(false);
    expect(store.isItemAdded).toBe(false);
    expect(store.isItemChange).toBe(false);
    expect(store.isItemChanged).toBe(false);
    expect(store.isItemDelete).toBe(false);
    expect(store.isItemDeleted).toBe(false);
  });

  it("should update state with setters", () => {
    const store = useLinkTreesStore();
    store.setLinkTrees([{ id: 1 }]);
    expect(store.linkTrees).toEqual([{ id: 1 }]);

    store.setLinkTree({ id: 1 });
    expect(store.linkTree).toEqual({ id: 1 });

    store.setIsLinkTree(true);
    expect(store.isLinkTree).toBe(true);

    store.setIsLinkTreeAdd(true);
    expect(store.isLinkTreeAdd).toBe(true);

    store.setIsLinkTreeAdded(true);
    expect(store.isLinkTreeAdded).toBe(true);

    store.setIsLinkTreeChange(true);
    expect(store.isLinkTreeChange).toBe(true);

    store.setIsLinkTreeChanged(true);
    expect(store.isLinkTreeChanged).toBe(true);

    store.setIsLinkTreeChangeCover(true);
    expect(store.isLinkTreeChangeCover).toBe(true);

    store.setIsLinkTreeChangedCover(true);
    expect(store.isLinkTreeChangedCover).toBe(true);

    store.setIsLinkTreeDelete(true);
    expect(store.isLinkTreeDelete).toBe(true);

    store.setIsLinkTreeDeleted(true);
    expect(store.isLinkTreeDeleted).toBe(true);

    store.setIsLinkTreesDelete(true);
    expect(store.isLinkTreesDelete).toBe(true);

    store.setIsLinkTreesDeleted(true);
    expect(store.isLinkTreesDeleted).toBe(true);

    store.setIsItemAdd(true);
    expect(store.isItemAdd).toBe(true);

    store.setIsItemAdded(true);
    expect(store.isItemAdded).toBe(true);

    store.setIsItemChange(true);
    expect(store.isItemChange).toBe(true);

    store.setIsItemChanged(true);
    expect(store.isItemChanged).toBe(true);

    store.setIsItemDelete(true);
    expect(store.isItemDelete).toBe(true);

    store.setIsItemDeleted(true);
    expect(store.isItemDeleted).toBe(true);
  });

  describe("asyncSetLinkTrees", () => {
    it("should set linkTrees on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue([{ id: 1 }]);

      await store.asyncSetLinkTrees("1");
      expect(store.linkTrees).toEqual([{ id: 1 }]);
    });

    it("should set empty array on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "getLinkTrees").mockRejectedValue(new Error("Err"));

      await store.asyncSetLinkTrees();
      expect(store.linkTrees).toEqual([]);
    });
  });

  describe("asyncSetLinkTree", () => {
    it("should set linkTree and setIsLinkTree on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({ id: 1 });

      await store.asyncSetLinkTree(1);
      expect(store.linkTree).toEqual({ id: 1 });
      expect(store.isLinkTree).toBe(true);
    });

    it("should set null and setIsLinkTree on error", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("Err"));

      await store.asyncSetLinkTree(99);
      expect(store.linkTree).toBeNull();
      expect(store.isLinkTree).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeAdd", () => {
    it("should post linkTree, show success dialog, and set flags on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTree").mockResolvedValue({ link_tree_id: 1 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeAdd("Title", "public", "Desc");

      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil ditambahkan!");
      expect(store.isLinkTreeAdded).toBe(true);
      expect(store.isLinkTreeAdd).toBe(true);
    });

    it("should show error dialog and set flags on failure", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTree").mockRejectedValue(new Error("Gagal tambah"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeAdd("Title", "public", "Desc");

      expect(errorSpy).toHaveBeenCalledWith("Gagal tambah");
      expect(store.isLinkTreeAdded).toBe(false);
      expect(store.isLinkTreeAdd).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeChange", () => {
    it("should update linkTree, show success dialog, and set flags on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("Link tree diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeChange(1, "Title", "public", "Desc");

      expect(successSpy).toHaveBeenCalledWith("Link tree diubah");
      expect(store.isLinkTreeChanged).toBe(true);
      expect(store.isLinkTreeChange).toBe(true);
    });

    it("should use fallback success message when api returns empty string", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeChange(1, "Title", "public", "Desc");
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil diperbarui!");
    });

    it("should show error dialog and set flags on failure", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putLinkTree").mockRejectedValue(new Error("Gagal update"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeChange(1, "Title", "public", "Desc");

      expect(errorSpy).toHaveBeenCalledWith("Gagal update");
      expect(store.isLinkTreeChanged).toBe(false);
      expect(store.isLinkTreeChange).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeChangeCover", () => {
    it("should upload cover, show success dialog, and set flags on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("Cover diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "cover.jpg");
      await store.asyncSetIsLinkTreeChangeCover(1, dummyFile);

      expect(successSpy).toHaveBeenCalledWith("Cover diubah");
      expect(store.isLinkTreeChangedCover).toBe(true);
      expect(store.isLinkTreeChangeCover).toBe(true);
    });

    it("should use fallback success message if empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "cover.jpg");
      await store.asyncSetIsLinkTreeChangeCover(1, dummyFile);

      expect(successSpy).toHaveBeenCalledWith("Cover berhasil diperbarui!");
    });

    it("should show error dialog and set flags on failure", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockRejectedValue(new Error("File corrupt"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "cover.jpg");
      await store.asyncSetIsLinkTreeChangeCover(1, dummyFile);

      expect(errorSpy).toHaveBeenCalledWith("File corrupt");
      expect(store.isLinkTreeChangedCover).toBe(false);
      expect(store.isLinkTreeChangeCover).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeDelete", () => {
    it("should delete linkTree, show success dialog, and set flags on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("Link tree dihapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeDelete(1);

      expect(successSpy).toHaveBeenCalledWith("Link tree dihapus");
      expect(store.isLinkTreeDeleted).toBe(true);
      expect(store.isLinkTreeDelete).toBe(true);
    });

    it("should use fallback success message if empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil dihapus!");
    });

    it("should show error dialog and set flags on failure", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockRejectedValue(new Error("Gagal hapus"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreeDelete(1);

      expect(errorSpy).toHaveBeenCalledWith("Gagal hapus");
      expect(store.isLinkTreeDeleted).toBe(false);
      expect(store.isLinkTreeDelete).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreesDelete", () => {
    it("should delete all link trees, show success dialog, and set flags on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue("Semua link tree dihapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreesDelete();

      expect(successSpy).toHaveBeenCalledWith("Semua link tree dihapus");
      expect(store.isLinkTreesDeleted).toBe(true);
      expect(store.isLinkTreesDelete).toBe(true);
    });

    it("should use fallback success message if empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreesDelete();
      expect(successSpy).toHaveBeenCalledWith("Semua link tree berhasil dihapus!");
    });

    it("should show error dialog and set flags on failure", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockRejectedValue(new Error("Gagal hapus semua"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsLinkTreesDelete();

      expect(errorSpy).toHaveBeenCalledWith("Gagal hapus semua");
      expect(store.isLinkTreesDeleted).toBe(false);
      expect(store.isLinkTreesDelete).toBe(true);
    });
  });

  describe("asyncSetIsItemAdd", () => {
    it("should add item, show success dialog, and set flags on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTreeItem").mockResolvedValue({ item_id: 1 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsItemAdd(1, "Item", "https://delcom.org");

      expect(successSpy).toHaveBeenCalledWith("Tautan berhasil ditambahkan!");
      expect(store.isItemAdded).toBe(true);
      expect(store.isItemAdd).toBe(true);
    });

    it("should show error dialog on failure", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "postLinkTreeItem").mockRejectedValue(new Error("Gagal tambah tautan"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsItemAdd(1, "", "");

      expect(errorSpy).toHaveBeenCalledWith("Gagal tambah tautan");
      expect(store.isItemAdded).toBe(false);
      expect(store.isItemAdd).toBe(true);
    });
  });

  describe("asyncSetIsItemChange", () => {
    it("should update item, show success dialog, and set flags on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putLinkTreeItem").mockResolvedValue("Item diperbarui");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsItemChange(1, 2, "Item", "https://delcom.org");

      expect(successSpy).toHaveBeenCalledWith("Item diperbarui");
      expect(store.isItemChanged).toBe(true);
      expect(store.isItemChange).toBe(true);
    });

    it("should use fallback success message if empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putLinkTreeItem").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsItemChange(1, 2, "Item", "https://delcom.org");
      expect(successSpy).toHaveBeenCalledWith("Tautan berhasil diperbarui!");
    });

    it("should show error dialog on failure", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "putLinkTreeItem").mockRejectedValue(new Error("Gagal ubah"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsItemChange(1, 2, "", "");

      expect(errorSpy).toHaveBeenCalledWith("Gagal ubah");
      expect(store.isItemChanged).toBe(false);
      expect(store.isItemChange).toBe(true);
    });
  });

  describe("asyncSetIsItemDelete", () => {
    it("should delete item, show success dialog, and set flags on success", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockResolvedValue("Item dihapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsItemDelete(1, 2);

      expect(successSpy).toHaveBeenCalledWith("Item dihapus");
      expect(store.isItemDeleted).toBe(true);
      expect(store.isItemDelete).toBe(true);
    });

    it("should use fallback success message if empty", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsItemDelete(1, 2);
      expect(successSpy).toHaveBeenCalledWith("Tautan berhasil dihapus!");
    });

    it("should show error dialog on failure", async () => {
      const store = useLinkTreesStore();
      vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockRejectedValue(new Error("Gagal hapus"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsItemDelete(1, 2);

      expect(errorSpy).toHaveBeenCalledWith("Gagal hapus");
      expect(store.isItemDeleted).toBe(false);
      expect(store.isItemDelete).toBe(true);
    });
  });
});
