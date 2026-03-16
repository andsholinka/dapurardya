"use client";

import dynamic from "next/dynamic";

const AdminAnalytics = dynamic(
  () => import("@/components/AdminAnalytics").then((m) => m.AdminAnalytics),
  {
    loading: () => (
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      </div>
    ),
    ssr: false,
  }
);

export { AdminAnalytics };
