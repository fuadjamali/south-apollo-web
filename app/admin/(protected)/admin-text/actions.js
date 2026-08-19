"use server";

import { revalidatePath } from "next/cache";
import { updateAdminText } from "@/lib/adminText";

export async function updateAdminTextAction(prevState, formData) {
  const loginHeading = formData.get("loginHeading")?.toString().trim();
  const loginSubheading = formData.get("loginSubheading")?.toString().trim();
  const dashboardHeading = formData.get("dashboardHeading")?.toString().trim();
  const dashboardSubheading = formData.get("dashboardSubheading")?.toString().trim();

  if (!loginHeading || !loginSubheading || !dashboardHeading || !dashboardSubheading) {
    return { error: "All four fields are required." };
  }

  await updateAdminText({ loginHeading, loginSubheading, dashboardHeading, dashboardSubheading });

  revalidatePath("/admin/login");
  revalidatePath("/admin");
  revalidatePath("/admin/admin-text");
  return { success: "Admin panel text saved." };
}
