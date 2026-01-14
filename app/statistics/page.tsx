"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Building2, 
  Briefcase, 
  ClipboardList,
  Users,
  TrendingUp,
  School,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Statistics {
  overview: {
    totalStudents: number;
    totalCompanies: number;
    totalJobPositions: number;
    totalInternships: number;
    activeInternships: number;
    completedInternships: number;
    totalUsers: number;
    totalUniversities: number;
  };
  internshipsByStatus: Array<{ status: string; count: number }>;
  companiesByType: Array<{ type: string; count: number }>;
  monthlyStats: Array<{ month: string; count: number }>;
  statsByUniversity: Array<{ universityId: string | null; count: number }>;
}

// Modern gradient color palette
const MODERN_COLORS = [
  'hsl(217, 91%, 60%)', // Primary blue
  'hsl(142, 76%, 36%)', // Green
  'hsl(38, 92%, 50%)', // Amber
  'hsl(346, 77%, 50%)', // Rose
  'hsl(262, 83%, 58%)', // Purple
  'hsl(199, 89%, 48%)', // Cyan
];

const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/statistics/public");
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-");
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${months[parseInt(monthNum) - 1]} ${year}`;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "รอดำเนินการ",
      approved: "อนุมัติแล้ว",
      rejected: "ปฏิเสธ",
      completed: "เสร็จสิ้น",
      in_progress: "กำลังฝึกงาน",
    };
    return statusMap[status] || status;
  };

  // Card configurations with modern styling
  const cardConfigs = [
    {
      key: 'totalStudents',
      title: 'นักศึกษาทั้งหมด',
      value: statistics?.overview.totalStudents ?? 0,
      icon: GraduationCap,
      gradient: 'from-blue-500/10 via-blue-400/5 to-transparent',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-white',
      borderColor: 'border-blue-500/20',
      hoverGlow: 'hover:shadow-blue-500/20',
    },
    {
      key: 'totalCompanies',
      title: 'บริษัทที่เข้าร่วม',
      value: statistics?.overview.totalCompanies ?? 0,
      icon: Building2,
      gradient: 'from-purple-500/10 via-purple-400/5 to-transparent',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconColor: 'text-white',
      borderColor: 'border-purple-500/20',
      hoverGlow: 'hover:shadow-purple-500/20',
    },
    {
      key: 'totalJobPositions',
      title: 'ตำแหน่งงาน',
      value: statistics?.overview.totalJobPositions ?? 0,
      icon: Briefcase,
      gradient: 'from-emerald-500/10 via-emerald-400/5 to-transparent',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconColor: 'text-white',
      borderColor: 'border-emerald-500/20',
      hoverGlow: 'hover:shadow-emerald-500/20',
    },
    {
      key: 'totalInternships',
      title: 'การฝึกงานทั้งหมด',
      value: statistics?.overview.totalInternships ?? 0,
      icon: ClipboardList,
      gradient: 'from-orange-500/10 via-orange-400/5 to-transparent',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      iconColor: 'text-white',
      borderColor: 'border-orange-500/20',
      hoverGlow: 'hover:shadow-orange-500/20',
    },
    {
      key: 'activeInternships',
      title: 'กำลังฝึกงาน',
      value: statistics?.overview.activeInternships ?? 0,
      icon: TrendingUp,
      gradient: 'from-green-500/10 via-green-400/5 to-transparent',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      iconColor: 'text-white',
      borderColor: 'border-green-500/20',
      hoverGlow: 'hover:shadow-green-500/20',
      valueColor: 'text-green-600 dark:text-green-400',
    },
    {
      key: 'completedInternships',
      title: 'เสร็จสิ้นแล้ว',
      value: statistics?.overview.completedInternships ?? 0,
      icon: ClipboardList,
      gradient: 'from-cyan-500/10 via-cyan-400/5 to-transparent',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      iconColor: 'text-white',
      borderColor: 'border-cyan-500/20',
      hoverGlow: 'hover:shadow-cyan-500/20',
      valueColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      key: 'totalUsers',
      title: 'ผู้ใช้งาน',
      value: statistics?.overview.totalUsers ?? 0,
      icon: Users,
      gradient: 'from-pink-500/10 via-pink-400/5 to-transparent',
      iconBg: 'bg-gradient-to-br from-pink-500 to-pink-600',
      iconColor: 'text-white',
      borderColor: 'border-pink-500/20',
      hoverGlow: 'hover:shadow-pink-500/20',
    },
    {
      key: 'totalUniversities',
      title: 'มหาวิทยาลัย',
      value: statistics?.overview.totalUniversities ?? 0,
      icon: School,
      gradient: 'from-indigo-500/10 via-indigo-400/5 to-transparent',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      iconColor: 'text-white',
      borderColor: 'border-indigo-500/20',
      hoverGlow: 'hover:shadow-indigo-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-background py-16 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                สถิติการฝึกงาน
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ข้อมูลสรุปและสถิติการฝึกงานของระบบ
              </p>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="relative py-12 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="absolute -top-8 -right-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {isLoading ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card 
                      key={i}
                      className="border-2 border-primary/10 bg-gradient-to-br from-card/50 to-card"
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-10 rounded-xl" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : statistics ? (
              <div className="space-y-8 animate-fade-in-up">
                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {cardConfigs.map((config, index) => {
                    const Icon = config.icon;
                    return (
                      <Card
                        key={config.key}
                        className={cn(
                          "relative overflow-hidden border-2 transition-all duration-300",
                          "hover:scale-105 hover:shadow-xl hover:-translate-y-1",
                          config.borderColor,
                          config.hoverGlow,
                          "bg-gradient-to-br",
                          config.gradient,
                          "group animate-fade-in-up"
                        )}
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                          <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
                            "transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                            config.iconBg
                          )}>
                            <Icon className={cn("h-5 w-5", config.iconColor)} />
                          </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                          <div className={cn(
                            "text-3xl font-bold transition-colors duration-300",
                            config.valueColor || "text-foreground"
                          )}>
                            {config.value.toLocaleString('th-TH')}
                          </div>
                        </CardContent>
                        
                        {/* Subtle glow effect */}
                        <div 
                          className={cn(
                            "absolute -bottom-2 -right-2 w-24 h-24 rounded-full blur-2xl opacity-0",
                            "group-hover:opacity-20 transition-opacity duration-300"
                          )}
                          style={{
                            background: config.iconBg.includes('blue') ? 'rgba(59, 130, 246, 0.3)' :
                                       config.iconBg.includes('purple') ? 'rgba(139, 92, 246, 0.3)' :
                                       config.iconBg.includes('emerald') ? 'rgba(16, 185, 129, 0.3)' :
                                       config.iconBg.includes('orange') ? 'rgba(249, 115, 22, 0.3)' :
                                       config.iconBg.includes('green') ? 'rgba(34, 197, 94, 0.3)' :
                                       config.iconBg.includes('cyan') ? 'rgba(6, 182, 212, 0.3)' :
                                       config.iconBg.includes('pink') ? 'rgba(236, 72, 153, 0.3)' :
                                       'rgba(99, 102, 241, 0.3)'
                          }}
                        />
                      </Card>
                    );
                  })}
                </div>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Internships by Status */}
                  <Card className="relative overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-primary/20 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-xl">สถานะการฝึกงาน</CardTitle>
                      <CardDescription>จำนวนการฝึกงานแยกตามสถานะ</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statistics.internshipsByStatus.map((item) => ({
                              name: getStatusLabel(item.status),
                              value: item.count,
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={90}
                            innerRadius={40}
                            fill="#8884d8"
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                            animationEasing="ease-out"
                          >
                            {statistics.internshipsByStatus.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                stroke="rgba(255, 255, 255, 0.1)"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Companies by Type */}
                  {statistics.companiesByType.length > 0 && (
                    <Card className="relative overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-primary/20 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                      <CardHeader className="relative z-10">
                        <CardTitle className="text-xl">บริษัทแยกตามประเภท</CardTitle>
                        <CardDescription>จำนวนบริษัทแยกตามประเภท</CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart 
                            data={statistics.companiesByType}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          >
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              stroke="hsl(var(--border))"
                              opacity={0.3}
                            />
                            <XAxis 
                              dataKey="type" 
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              }}
                              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                            />
                            <Bar 
                              dataKey="count" 
                              radius={[8, 8, 0, 0]}
                              animationBegin={0}
                              animationDuration={800}
                              animationEasing="ease-out"
                            >
                              {statistics.companiesByType.map((_, index) => (
                                <Cell 
                                  key={`cell-${index}`}
                                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Monthly Statistics */}
                  {statistics.monthlyStats.length > 0 && (
                    <Card className="md:col-span-2 relative overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-primary/20 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                      <CardHeader className="relative z-10">
                        <CardTitle className="text-xl">สถิติรายเดือน (12 เดือนล่าสุด)</CardTitle>
                        <CardDescription>จำนวนการฝึกงานที่สร้างในแต่ละเดือน</CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <ResponsiveContainer width="100%" height={350}>
                          <LineChart 
                            data={statistics.monthlyStats.map((item) => ({
                              month: formatMonth(item.month),
                              count: item.count,
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              stroke="hsl(var(--border))"
                              opacity={0.3}
                            />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              }}
                              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                            />
                            <Legend 
                              wrapperStyle={{ paddingTop: '20px' }}
                              iconType="line"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="count" 
                              stroke={CHART_COLORS[0]}
                              strokeWidth={3}
                              dot={{ fill: CHART_COLORS[0], r: 5, strokeWidth: 2, stroke: 'white' }}
                              activeDot={{ r: 7, stroke: CHART_COLORS[0], strokeWidth: 2 }}
                              animationBegin={0}
                              animationDuration={1000}
                              animationEasing="ease-out"
                            />
                            <defs>
                              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">ไม่พบข้อมูล</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    ไม่สามารถโหลดข้อมูลสถิติได้ในขณะนี้
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
