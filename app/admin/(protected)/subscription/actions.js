"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateAdminMobile } from "@/lib/admins";

export async function updateMobileAction(prevState, formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Not signed in." };
  }

  const mobileNo = formData.get("mobileNo")?.toString().trim() || "";

  await updateAdminMobile(session.user.email, mobileNo);

  return { success: "Mobile number updated." };
}
