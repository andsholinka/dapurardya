import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await getDb();

    const [totalRecipes, totalMembers, totalRequests, pendingRequests] = await Promise.all([
      db.collection("recipes").countDocuments({ published: true }),
      db.collection("members").countDocuments({}),
      db.collection("recipe_requests").countDocuments({}),
      db.collection("recipe_requests").countDocuments({ status: "pending" }),
    ]);

    // Request per bulan — 6 bulan terakhir
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const requestsByMonth = await db.collection("recipe_requests").aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]).toArray();

    // Isi bulan yang kosong dengan 0
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = requestsByMonth.find((r) => r._id.year === year && r._id.month === month);
      chartData.push({ month: monthNames[month - 1], requests: found?.count ?? 0 });
    }

    return NextResponse.json({ totalRecipes, totalMembers, totalRequests, pendingRequests, chartData });
  } catch (e) {
    console.error("[ANALYTICS]", e);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
