"use client";

import { useState } from "react";
import { Send, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/admin/notification/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal mengirim broadcast");
      
      setStatus(`Berhasil! Dikirim ke ${data.sentCount} perangkat. Gagal: ${data.failureCount}`);
      setTitle("");
      setBody("");
    } catch (err) {
      setStatus("Error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <Megaphone className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Broadcast Notifikasi</h1>
          <p className="text-sm text-muted-foreground">Kirim push notification ke semua user PWA Dapur Ardya.</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-6 bg-card border-2 p-6 rounded-3xl shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Judul Notifikasi</label>
          <Input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Contoh: Fitur Baru Rilis! 🚀" 
            required 
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Isi Pesan</label>
          <Textarea 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            placeholder="Jelaskan fitur barunya di sini..." 
            required 
            className="rounded-xl min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">URL Tujuan (opsional)</label>
          <Input 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            placeholder="/kulkas atau /resep/slug-resep" 
            className="rounded-xl"
          />
        </div>

        {status && (
          <p className={`p-4 rounded-xl text-sm font-medium ${status.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            {status}
          </p>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 rounded-xl text-lg font-bold" 
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2 size-5" />}
          Kirim Notifikasi Sekarang
        </Button>
      </form>
    </div>
  );
}
