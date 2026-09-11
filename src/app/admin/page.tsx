import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { backendFetch } from "@/lib/backend-fetch";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

const C = {
  border: "#e7e5e4", text: "#1c1917", muted: "#78716c", bg: "#fafaf8",
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const [usersRes, rolesRes] = await Promise.all([
    backendFetch("/auth/users"),
    backendFetch("/auth/roles"),
  ]);

  const users = usersRes.ok ? await usersRes.json() : [];
  const roles = rolesRes.ok ? await rolesRes.json() : [];

  return (
    <div className="min-h-full" style={{ background: C.bg }}>
      <header className="border-b bg-white px-6 py-5" style={{ borderColor: C.border }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
          Platform
        </p>
        <h1 className="text-xl font-semibold mt-0.5" style={{ color: C.text }}>
          Admin
        </h1>
        <p className="text-sm mt-1" style={{ color: C.muted }}>
          Manage users and platform access.
        </p>
      </header>

      <div className="px-6 py-6 max-w-4xl">
        <AdminPanel initialUsers={users} roles={roles} />
      </div>
    </div>
  );
}
