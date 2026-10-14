import { describe, it, expect, vi, beforeEach } from "vitest";
import SidebarComponent from "./SidebarComponent.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";

describe("SidebarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render navigation items", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: false },
      route: "/",
    });

    expect(wrapper.text()).toContain("Semua Link Tree");
    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("should highlight active navigation item correctly", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: false },
      route: "/users",
    });

    const links = wrapper.findAll("a");
    expect(links.length).toBe(3);
    expect(links[1].classes()).toContain("bg-indigo-600");
  });

  it("should navigate and trigger close on item click", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const closeSpy = vi.fn();

    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
      route: "/",
    });

    const links = wrapper.findAll("a");
    await links[1].trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/users");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should trigger close on mobile backdrop click and Escape key", async () => {
    const closeSpy = vi.fn();

    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    expect(backdrop.exists()).toBe(true);

    await backdrop.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(1);

    await backdrop.trigger("keydown", { key: "Enter" });
    expect(closeSpy).toHaveBeenCalledTimes(1);

    await backdrop.trigger("keydown", { key: "Escape" });
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle navigation and backdrop click when callback is omitted", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { isSidebarOpen: true },
      route: "/",
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    await backdrop.trigger("click");
    await backdrop.trigger("keydown", { key: "Escape" });

    const links = wrapper.findAll("a");
    await links[0].trigger("click");

    expect(wrapper.exists()).toBe(true);
  });
});
