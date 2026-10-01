"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import {
  Star,
  Search,
  Filter,
  TrendingUp,
  Clock,
  MessageCircle,
  MapPin,
  ChevronRight,
  MoreVertical,
  ChevronLeft,
  Megaphone,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Heart,
  Send,
  X
} from "lucide-react";

export default function UlasanBisnisPage() {
  const [activeTab, setActiveTab] = useState<"semua" | "belum" | "sudah">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const reviews = [
    {
      id: 1,
      name: "Andi Pratama",
      time: "2 hari yang lalu",
      rating: 5.0,
      roleBadge: "Pembeli",
      status: "sudah",
      text: "Makanannya enak banget, pelayanannya juga ramah. Tempatnya nyaman dan bersih. Rasa makanannya sesuai dengan harga.",
      photos: [],
      extraPhotoCount: 0,
      tag: "Makan di tempat",
      location: "Kedai Rasa Kita, Jakarta",
      reply: "Terima kasih banyak Mas Andi! Senang sekali makanan dan pelayanan kami berkenan di hati. Sampai jumpa di kunjungan berikutnya!",
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      time: "5 hari yang lalu",
      rating: 4.0,
      roleBadge: "Pembeli",
      status: "belum",
      text: "Tempatnya nyaman dan bersih. Rasa makanannya sesuai dengan harga.",
      photos: [],
      extraPhotoCount: 0,
      tag: "Makan di tempat",
      location: "Kedai Rasa Kita, Jakarta",
      reply: null,
    },
    {
      id: 3,
      name: "Budi Santoso",
      time: "1 minggu yang lalu",
      rating: 4.0,
      roleBadge: "Pembeli",
      status: "sudah",
      text: "Cukup baik, tapi perlu ditingkatkan lagi untuk waktu penyajian.",
      photos: [],
      extraPhotoCount: 0,
      tag: "Makan di tempat",
      location: "Kedai Rasa Kita, Jakarta",
      reply: "Terima kasih atas masukannya Pak Budi. Kami akan mengevaluasi kecepatan penyajian dapur kami agar lebih baik lagi.",
    },
    {
      id: 4,
      name: "Dewi Lestari",
      time: "1 minggu yang lalu",
      rating: 5.0,
      roleBadge: "Pembeli",
      status: "sudah",
      text: "Sangat puas dengan pelayanannya! Makanannya enak dan tempatnya cozy. Pasti akan kembali lagi!",
      photos: [],
      extraPhotoCount: 0,
      tag: "Makan di tempat",
      location: "Kedai Rasa Kita, Jakarta",
      reply: "Terima kasih Mbak Dewi! Ditunggu kedatangannya kembali ya!",
    },
  ];

  const filteredReviews = reviews.filter((rev) => {
    if (activeTab === "belum" && rev.status !== "belum") return false;
    if (activeTab === "sudah" && rev.status !== "sudah") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rev.name.toLowerCase().includes(q) ||
        rev.text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4faf7] flex flex-col font-sans text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Top Header & Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Link href="/untuk-bisnis" className="hover:text-[#008767]">
                  Ulasan
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-600 font-semibold">Semua Ulasan</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Ulasan Pelanggan
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Lihat dan kelola semua ulasan dari pelanggan tentang bisnis Anda.
              </p>
            </div>

            {/* Search Box & Filter & Annotation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari ulasan, nama pelanggan, atau kata kunci..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#008767]/30 focus:border-[#008767] transition-all shadow-2xs"
                />
              </div>

              <button className="px-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-2xs">
                <Filter className="w-4 h-4 text-slate-500" />
                <span>Filter</span>
              </button>

              {/* Handwritten Note Top Right */}
              <div className="hidden lg:block absolute -top-10 -right-4 text-right transform rotate-2 pointer-events-none">
                <p className="text-[11px] font-semibold text-[#008767] tracking-wide leading-tight">
                  Setiap ulasan <br /> adalah kesempatan <br /> untuk lebih baik ♡
                </p>
              </div>
            </div>
          </div>

          {/* Status Tabs Filter */}
          <div className="flex items-center gap-2 pt-2 border-b border-slate-200/60 pb-3">
            <button
              onClick={() => setActiveTab("semua")}
              className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === "semua"
                  ? "bg-[#008767] text-white shadow-md shadow-[#008767]/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <span>Semua Ulasan</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "semua" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                124
              </span>
            </button>

            <button
              onClick={() => setActiveTab("belum")}
              className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === "belum"
                  ? "bg-[#008767] text-white shadow-md shadow-[#008767]/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <span>Belum Dibalas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                3
              </span>
            </button>

            <button
              onClick={() => setActiveTab("sudah")}
              className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                activeTab === "sudah"
                  ? "bg-[#008767] text-white shadow-md shadow-[#008767]/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <span>Sudah Dibalas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                121
              </span>
            </button>
          </div>

          {/* Main Grid: Review Cards Left, Analytics Sidebar Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Review Items List */}
            <div className="lg:col-span-8 space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                Menampilkan 1–10 dari {filteredReviews.length} ulasan
              </p>

              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 font-bold text-slate-600 flex items-center justify-center text-sm border border-slate-200">
                        {rev.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{rev.name}</h3>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                            {rev.roleBadge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(rev.rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-xs text-slate-800">{rev.rating.toFixed(1)}</span>
                          <span className="text-slate-400 text-xs">• {rev.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Actions */}
                    <div className="flex items-center gap-2">
                      {rev.status === "sudah" ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                          Sudah dibalas
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                          Belum dibalas
                        </span>
                      )}
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    "{rev.text}"
                  </p>

                  {/* Review Photos */}
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {rev.photos.map((img, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group cursor-pointer"
                        >
                          <img
                            src={img}
                            alt="Attachment"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {i === rev.photos.length - 1 && rev.extraPhotoCount > 0 && (
                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-bold text-xs">
                              +{rev.extraPhotoCount}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer Tags & Reply Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                        {rev.tag}
                      </span>
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{rev.location}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedReviewId(selectedReviewId === rev.id ? null : rev.id)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        rev.status === "sudah"
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          : "bg-[#008767] hover:bg-[#007055] text-white shadow-xs"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{rev.status === "sudah" ? "Lihat Balasan" : "Balas"}</span>
                    </button>
                  </div>

                  {/* Inline Reply Panel */}
                  {selectedReviewId === rev.id && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
                      {rev.reply ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#008767]">
                              Balasan Anda (Kedai Rasa Kita):
                            </span>
                            <span className="text-[10px] text-slate-400">Terikirim</span>
                          </div>
                          <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                            {rev.reply}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-700">
                            Tulis Balasan Resmi Bisnis:
                          </label>
                          <textarea
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Terima kasih atas ulasannya! Kami selalu berusaha..."
                            className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#008767]/30 bg-white"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedReviewId(null)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => {
                                alert("Balasan berhasil dikirim!");
                                setSelectedReviewId(null);
                                setReplyText("");
                              }}
                              className="px-4 py-1.5 rounded-lg bg-[#008767] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:bg-[#007055]"
                            >
                              <Send className="w-3 h-3" />
                              <span>Kirim Balasan</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-center gap-1.5 pt-4">
                <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-[#008767] text-white font-bold text-xs flex items-center justify-center">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center hover:bg-slate-100">
                  2
                </button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center hover:bg-slate-100">
                  3
                </button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center hover:bg-slate-100">
                  4
                </button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center hover:bg-slate-100">
                  5
                </button>
                <span className="text-slate-400 text-xs px-1">...</span>
                <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center hover:bg-slate-100">
                  13
                </button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right Column: Analytics Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Ringkasan Ulasan Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-[#008767]">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-[#008767] text-[#008767]" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Ringkasan Ulasan</h3>
                </div>

                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-4xl font-extrabold text-slate-900">4.5</span>
                  <div>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-emerald-600 font-bold text-xs flex items-center gap-0.5 mt-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +0.2 <span className="text-slate-400 font-normal">dari bulan lalu</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500 font-medium">Total Ulasan</span>
                    <span className="font-extrabold text-slate-900 text-sm">2.843</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      +12%
                    </span>
                  </div>

                  {/* Rating Distribution Bars */}
                  <div className="space-y-1.5 text-xs">
                    {[
                      { star: 5, pct: 68 },
                      { star: 4, pct: 18 },
                      { star: 3, pct: 8 },
                      { star: 2, pct: 4 },
                      { star: 1, pct: 2 },
                    ].map((row) => (
                      <div key={row.star} className="flex items-center gap-2">
                        <span className="w-3 font-semibold text-slate-600">{row.star}★</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-[#008767] rounded-full"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                        <span className="w-7 text-right text-slate-400 text-[11px]">{row.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insight Singkat Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[#008767]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Insight Singkat</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Ulasan positif meningkat</p>
                      <p className="text-slate-500">12% dibanding bulan lalu.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Pengunjung paling sering ulasan</p>
                      <p className="text-slate-500">di jam 12.00 – 14.00.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Kata yang paling sering muncul:</p>
                      <p className="text-slate-500 font-medium">"enak", "ramah", "nyaman".</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tanggapi Setiap Ulasan Card */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-[#d8f2ea] rounded-2xl border border-emerald-200 p-5 shadow-2xs space-y-3 relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                  <h4 className="font-extrabold text-slate-900 text-sm">Tanggapi setiap ulasan</h4>
                  <p className="text-xs text-slate-600">
                    Tunjukkan bahwa Anda peduli dengan pelanggan Anda.
                  </p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all relative z-10">
                  <span>Lihat Panduan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-[#d8f2ea] rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#008767] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Tingkatkan reputasi bisnis Anda</h4>
                <p className="text-xs text-slate-600">
                  Respons ulasan pelanggan, kelola citra bisnis, dan tarik lebih banyak pelanggan.
                </p>
              </div>
            </div>

            <button className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#008767] border border-emerald-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all flex-shrink-0">
              <span>Lihat Panduan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
