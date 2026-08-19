import { getAdminText } from "@/lib/adminText";
import AdminLoginForm from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const adminText = await getAdminText();

  return (
    <AdminLoginForm
      heading={adminText.login_heading}
      subheading={adminText.login_subheading}
    />
  );
}
