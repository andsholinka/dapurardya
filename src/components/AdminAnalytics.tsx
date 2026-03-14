"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BookOpen, Users, ClipboardList, Clock } from "lucide-react";

interface AnalyticsData {
  totalRecipes: number;
  totalMembers: number;
  totalRequests: number;
  pendingRequests: number;
  chartData: { month: string; requests: number }[];
}

const chartConfig = {
  requests: { label: "Request", color: "var(--color-primary)" },
};

export function AdminAnalytics({ data }: { data: AnalyticsData }) {
  const stats = [
    {
      label: "Total Resep",
      value: data.totalRecipes,
      icon: BookOpen,
      desc: "Resep dipublikasikan",
    },
    {
      label: "Total Member",
      value: data.totalMembers,
      icon: Users,
      desc: "Member terdaftar",
    },
    {
      label: "Total Request",
      value: data.totalRequests,
      icon: ClipboardList,
      desc: "Semua request masuk",
    },
    {
      label: "Menunggu",
      value: data.pendingRequests,
      icon: Clock,
      desc: "Request belum selesai",
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl border-2">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <s.icon className="size-4 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar Chart */}
      <Card className="rounded-2xl border-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Request Resep per Bulan</CardTitle>
          <CardDescription>6 bulan terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} barSize={32}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  allowDecimals={false}
                  width={24}
                />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--muted)", radius: 6 }} />
                <Bar dataKey="requests" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
