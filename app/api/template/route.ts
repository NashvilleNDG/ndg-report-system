import { NextRequest, NextResponse } from "next/server";
import { generateTemplate } from "@/lib/excel-parser";

export async function GET(req: NextRequest) {
  const buffer = generateTemplate();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="ndg-report-template.xlsx"',
    },
  });
}
