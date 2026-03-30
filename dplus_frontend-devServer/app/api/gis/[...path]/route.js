import { NextResponse } from "next/server";

const resolveBaseUrl = () => {
  const value = process.env.DPLUS_GIS_BASE_URL?.trim();
  if (!value) {
    throw new Error("Missing DPLUS_GIS_BASE_URL");
  }
  return value.replace(/\/+$/, "");
};

const getAuthToken = () => process.env.DPLUS_GIS_TOKEN?.trim() || "";

const buildTargetUrl = (request, params) => {
  const pathname = Array.isArray(params?.path) ? params.path.join("/") : "";
  const incoming = new URL(request.url);
  const target = new URL(`${resolveBaseUrl()}/${pathname}`);
  incoming.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });
  return target;
};

const proxyRequest = async (request, params) => {
  try {
    const target = buildTargetUrl(request, params);
    const headers = new Headers();
    headers.set("Accept", "application/json, text/plain, */*");

    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    const init = {
      method: request.method,
      headers,
      cache: "no-store",
    };

    if (!["GET", "HEAD"].includes(request.method)) {
      init.body = await request.text();
    }

    const response = await fetch(target, {
      ...init,
      signal: AbortSignal.timeout(25000),
    });
    const payload = await response.text();

    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.name === "TimeoutError"
            ? "GIS proxy timed out while waiting for the remote GIS server."
            : error.message || "GIS proxy request failed",
      },
      { status: 500 },
    );
  }
};

export async function GET(request, context) {
  return proxyRequest(request, context.params);
}

export async function POST(request, context) {
  return proxyRequest(request, context.params);
}
