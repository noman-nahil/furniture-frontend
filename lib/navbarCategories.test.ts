import { afterEach, describe, expect, it, vi } from "vitest";
import type { CategoryNav } from "@/types/categoryNav";
import type { ServerFetchFailure } from "@/lib/serverFetch";
import {
  filterNavbarCategories,
  getNavbarCategories,
  NAVBAR_CATEGORIES_REVALIDATE_SECONDS,
  resolveNavbarCategories,
} from "./navbarCategories";

vi.mock("@/lib/serverFetch", async () => {
  const actual = await vi.importActual<typeof import("@/lib/serverFetch")>(
    "@/lib/serverFetch",
  );
  return {
    ...actual,
    serverFetch: vi.fn(),
  };
});

import { serverFetch } from "@/lib/serverFetch";

const mockedFetch = vi.mocked(serverFetch);

function fail(
  errorType: ServerFetchFailure["errorType"],
  status?: number,
): ServerFetchFailure {
  return {
    __serverFetchError: true,
    errorType,
    ...(status !== undefined ? { status } : {}),
  };
}

const lesChambres: CategoryNav = {
  _id: "1",
  name: "LES CHAMBRES",
  slug: "les-chambres",
};
const table: CategoryNav = {
  _id: "2",
  name: "TABLE",
  slug: "table",
};
const lits: CategoryNav = {
  _id: "3",
  name: "LITS",
  slug: "lits",
};
const canapes: CategoryNav = {
  _id: "4",
  name: "CANAPÉS",
  slug: "canape",
};
const armoire: CategoryNav = {
  _id: "5",
  name: "ARMOIRE",
  slug: "armoire",
  showInNavbar: false,
};
const maisonParent: CategoryNav = {
  _id: "6",
  name: "Maison",
  slug: "maison",
  showInNavbar: false,
};

const visibleFour = [lesChambres, table, lits, canapes];

afterEach(() => {
  vi.clearAllMocks();
});

describe("filterNavbarCategories", () => {
  it("hides showInNavbar === false and keeps missing as visible", () => {
    const filtered = filterNavbarCategories([
      ...visibleFour,
      armoire,
      maisonParent,
    ]);
    expect(filtered.map((c) => c.slug)).toEqual([
      "les-chambres",
      "table",
      "lits",
      "canape",
    ]);
  });
});

describe("resolveNavbarCategories", () => {
  it("keeps dynamic categories on a successful list", () => {
    const resolved = resolveNavbarCategories([
      ...visibleFour,
      armoire,
      maisonParent,
    ]);
    expect(resolved.source).toBe("ok");
    expect(resolved.categories.map((c) => c.name)).toEqual([
      "LES CHAMBRES",
      "TABLE",
      "LITS",
      "CANAPÉS",
    ]);
  });

  it("treats 200 + [] as a legitimate empty catalog", () => {
    const resolved = resolveNavbarCategories([]);
    expect(resolved.source).toBe("ok");
    expect(resolved.categories).toEqual([]);
  });

  it("does not treat 429 as an empty catalog when last-known-good exists", () => {
    const resolved = resolveNavbarCategories(
      fail("client_error", 429),
      visibleFour,
    );
    expect(resolved.source).toBe("stale");
    expect(resolved.errorType).toBe("client_error");
    expect(resolved.status).toBe(429);
    expect(resolved.categories.map((c) => c.slug)).toEqual([
      "les-chambres",
      "table",
      "lits",
      "canape",
    ]);
  });

  it("does not treat 500 as an empty catalog when last-known-good exists", () => {
    const resolved = resolveNavbarCategories(
      fail("server_error", 500),
      visibleFour,
    );
    expect(resolved.source).toBe("stale");
    expect(resolved.errorType).toBe("server_error");
    expect(resolved.status).toBe(500);
    expect(resolved.categories).toHaveLength(4);
  });

  it("keeps last-known-good on timeout", () => {
    const resolved = resolveNavbarCategories(fail("timeout"), visibleFour);
    expect(resolved.source).toBe("stale");
    expect(resolved.errorType).toBe("timeout");
    expect(resolved.categories.map((c) => c.name)).toContain("LES CHAMBRES");
  });

  it("keeps last-known-good on network and invalid JSON failures", () => {
    const network = resolveNavbarCategories(fail("network"), visibleFour);
    expect(network.source).toBe("stale");
    expect(network.categories).toHaveLength(4);

    const parse = resolveNavbarCategories(fail("parse_error", 200), visibleFour);
    expect(parse.source).toBe("stale");
    expect(parse.categories).toHaveLength(4);
  });

  it("marks a failure without cache as unavailable, not a successful empty list", () => {
    const resolved = resolveNavbarCategories(fail("client_error", 429));
    expect(resolved.source).toBe("unavailable");
    expect(resolved.categories).toEqual([]);
  });

  it("replaces stale data with a later successful payload", () => {
    const afterFailure = resolveNavbarCategories(
      fail("server_error", 500),
      visibleFour,
    );
    expect(afterFailure.source).toBe("stale");

    const next = [table, lits];
    const afterSuccess = resolveNavbarCategories(next, afterFailure.categories);
    expect(afterSuccess.source).toBe("ok");
    expect(afterSuccess.categories.map((c) => c.slug)).toEqual(["table", "lits"]);
  });

  it("does not treat a non-array 200 body as an empty catalog", () => {
    const resolved = resolveNavbarCategories(
      { unexpected: true } as unknown as CategoryNav[],
      visibleFour,
    );
    expect(resolved.source).toBe("stale");
    expect(resolved.categories).toHaveLength(4);
  });
});

describe("getNavbarCategories", () => {
  it("requests /categories/active with the storefront revalidate window", async () => {
    mockedFetch.mockResolvedValueOnce(visibleFour);
    await getNavbarCategories();
    expect(mockedFetch).toHaveBeenCalledWith("/categories/active", {
      revalidate: NAVBAR_CATEGORIES_REVALIDATE_SECONDS,
    });
  });

  it("returns visible dynamic categories on success", async () => {
    mockedFetch.mockResolvedValueOnce([...visibleFour, armoire]);
    const categories = await getNavbarCategories();
    expect(categories.map((c) => c.name)).toEqual([
      "LES CHAMBRES",
      "TABLE",
      "LITS",
      "CANAPÉS",
    ]);
  });

  it("returns [] on a legitimate empty success so only MAISON would render", async () => {
    mockedFetch.mockResolvedValueOnce([]);
    await expect(getNavbarCategories()).resolves.toEqual([]);
  });

  it("does not convert 429/500 into a successful empty list", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockedFetch.mockResolvedValueOnce(fail("client_error", 429));
    await expect(getNavbarCategories()).resolves.toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: "navbarCategories",
        errorType: "client_error",
        status: 429,
      }),
    );
    errorSpy.mockRestore();
  });

  it("replaces a previous failure with a later successful list", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockedFetch.mockResolvedValueOnce(fail("timeout"));
    await expect(getNavbarCategories()).resolves.toEqual([]);

    mockedFetch.mockResolvedValueOnce(visibleFour);
    const categories = await getNavbarCategories();
    expect(categories.map((c) => c.slug)).toEqual([
      "les-chambres",
      "table",
      "lits",
      "canape",
    ]);
  });
});
