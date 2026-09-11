import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { backendFetch } from "@/lib/backend-fetch";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const res = await backendFetch("/auth/roles");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
