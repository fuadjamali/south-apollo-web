import { getAdminText } from "@/lib/adminText";
import { getBusinessInfo } from "@/lib/businessInfo";
import AdminLoginForm from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const [adminText, business] = await Promise.all([getAdminText(), getBusinessInfo()]);

  return (
    <AdminLoginForm
      businessName={business.name}
      heading={adminText.login_heading}
      subheading={adminText.login_subheading}
    />
  );
}
