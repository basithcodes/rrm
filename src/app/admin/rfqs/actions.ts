"use server";

// Admin-only server actions for the RFQ pipeline.
// Every action re-asserts the owner HMAC session before touching the
// database — defence-in-depth even though the /admin layout already gates
// the page render.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isOwnerAuthenticated } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

const updateStatusSchema = z.object({
  rfqId: z.string().min(1),
  status: z.enum(["NEW", "REVIEWING", "QUOTED", "CLOSED", "LOST"]),
});

export type UpdateRfqStatusResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateRfqStatus(
  input: z.input<typeof updateStatusSchema>,
): Promise<UpdateRfqStatusResult> {
  if (!(await isOwnerAuthenticated())) {
    return { ok: false, error: "Unauthorised." };
  }
  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const prisma = getPrismaClient();
  await prisma.rfq.update({
    where: { id: parsed.data.rfqId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/rfqs");
  return { ok: true };
}
