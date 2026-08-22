import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isServerFetchError, serverFetch } from "./serverFetch";

function hangingFetch(_input: RequestInfo | URL, init?: RequestInit) {
  return new Promise<Response>((_resolve, reject) => {
    const signal = init?.signal;
    if (!signal) return;
    if (signal.aborted) {
      reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      return;
    }
    signal.addEventListener("abort", () => {
      reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
    });
  });
}

describe("serverFetch timeout logging", () => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "https://example.test/api";
    delete process.env.API_INTERNAL_URL;
    errorSpy.mockClear();
    vi.stubGlobal("fetch", hangingFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("logs scope, path, error type, and duration before returning timeout", async () => {
    const res = await serverFetch("/categories/active", { timeoutMs: 40 });

    expect(isServerFetchError(res)).toBe(true);
    if (isServerFetchError(res)) {
      expect(res.errorType).toBe("timeout");
    }

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const payload = errorSpy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      scope: "serverFetch",
      path: "/categories/active",
      errorType: "timeout",
      timeoutMs: 40,
      reason: "timeout",
    });
    expect(typeof payload.durationMs).toBe("number");
    expect(payload.durationMs as number).toBeGreaterThanOrEqual(40);
    expect(payload).not.toHaveProperty("cookies");
    expect(payload).not.toHaveProperty("authorization");
    expect(payload).not.toHaveProperty("token");
  });
});
