import { isOwnerAuthenticated } from "@/lib/auth";
import { buildCatalogExtendedImportCsvText } from "@/lib/imports/csv";

export async function GET() {
  if (!(await isOwnerAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const csvText = buildCatalogExtendedImportCsvText();

  return new Response(csvText, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rrm-catalog-export.csv"',
      "Cache-Control": "no-store",
    },
  });
}