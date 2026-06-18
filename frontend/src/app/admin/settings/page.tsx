import { redirect } from "next/navigation";

/** Settings hub removed from nav — send visitors to user management. */
export default function SettingsIndexPage() {
  redirect("/admin/settings/users");
}
