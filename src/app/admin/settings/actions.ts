"use server";

// Hard-reset server action.
// Truncates customer-facing transactional data so the owner can rerun
// scripted scenarios without database surgery. Leaves catalog products,
// pricing, and trade secrets in place.

import { revalidatePath } from "next/cache";
import { isOwnerAuthenticated } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export type ResetResult =
  | { ok: true; deleted: { rfqs: number; rfqItems: number; customers: number } }
  | { ok: false; error: string };

export async function hardResetCatalog(): Promise<ResetResult> {
  if (!(await isOwnerAuthenticated())) {
    return { ok: false, error: "Unauthorised." };
  }

  const prisma = getPrismaClient();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const rfqItems = await tx.rfqItem.deleteMany();
      const rfqs = await tx.rfq.deleteMany();
      const customers = await tx.customer.deleteMany();
      return {
        rfqs: rfqs.count,
        rfqItems: rfqItems.count,
        customers: customers.count,
      };
    });

    revalidatePath("/admin/rfqs");
    revalidatePath("/admin");
    return { ok: true, deleted: result };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
