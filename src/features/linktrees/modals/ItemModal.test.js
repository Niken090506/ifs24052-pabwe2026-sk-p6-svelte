import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ItemModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: false, linkTreeId: 1 },
    });
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should show validation error if title is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul tautan tidak boleh kosong");
  });

  it("should show validation error if url is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    await titleInput.setValue("Label Tautan");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Alamat URL tidak boleh kosong");
  });

  it("should show validation error if url is invalid format", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    await titleInput.setValue("Label Tautan");

    const urlInput = wrapper.find('[data-testid="item-url-input"]');
    await urlInput.setValue("not-a-valid-url");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Alamat URL tidak valid!");
  });

  it("should call asyncSetIsItemAdd when item is null and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: {
        show: true,
        linkTreeId: 1,
        item: null,
        onClose: closeSpy,
      },
      preloadedState: {
        isItemAdd: false,
        isItemAdded: false,
      },
    });

    const addSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemAdd")
      .mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    const urlInput = wrapper.find('[data-testid="item-url-input"]');

    await titleInput.setValue("Portal Del");
    await urlInput.setValue("https://del.ac.id");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(addSpy).toHaveBeenCalledWith(1, "Portal Del", "https://del.ac.id");

    linkTreesStore.setIsItemAdd(true);
    linkTreesStore.setIsItemAdded(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle isItemAdd true when isItemAdded is false", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
      preloadedState: {
        isItemAdd: false,
        isItemAdded: false,
      },
    });

    linkTreesStore.setIsItemAdd(true);
    linkTreesStore.setIsItemAdded(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should populate fields when item is passed and call asyncSetIsItemChange", async () => {
    const closeSpy = vi.fn();
    const mockItem = {
      id: 5,
      title: "Existing Title",
      url: "https://existing.com",
    };

    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: {
        show: true,
        linkTreeId: 1,
        item: mockItem,
        onClose: closeSpy,
      },
      preloadedState: {
        isItemChange: false,
        isItemChanged: false,
      },
    });

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    const urlInput = wrapper.find('[data-testid="item-url-input"]');

    expect(titleInput.element.value).toBe("Existing Title");
    expect(urlInput.element.value).toBe("https://existing.com");

    const changeSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemChange")
      .mockReturnValue(Promise.resolve());

    await titleInput.setValue("Updated Title");
    await urlInput.setValue("https://updated.com");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, 5, "Updated Title", "https://updated.com");

    linkTreesStore.setIsItemChange(true);
    linkTreesStore.setIsItemChanged(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle isItemChange true when isItemChanged is false", async () => {
    const mockItem = { id: 5, title: "Title", url: "https://example.com" };
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem },
      preloadedState: {
        isItemChange: false,
        isItemChanged: false,
      },
    });

    linkTreesStore.setIsItemChange(true);
    linkTreesStore.setIsItemChanged(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should close modal when close or cancel button clicked", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ItemModal, {
      props: {
        show: true,
        linkTreeId: 1,
        onClose: closeSpy,
      },
    });

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-item-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle item with null title and null url and handle close without onClose callback", async () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: {
        show: true,
        linkTreeId: 1,
        item: { id: 99, title: null, url: null },
      },
    });

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.exists()).toBe(true);
  });
});
