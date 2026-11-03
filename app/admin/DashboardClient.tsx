'use client'

import { Coffee, Calendar, TrendingUp, Users, ArrowUpRight, CalendarPlus } from 'lucide-react'
import Link from 'next/link'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { StatsCard } from '@/components/admin/StatsCard'
import { formatBDT, getInitials, getAvatarColor } from '@/lib/utils'
import { ManualTeaEntryDialog } from '@/components/admin/ManualTeaEntryDialog'

interface DashboardClientProps {
  stats: {
    today: { count: number; revenue: number }
    week: { count: number; revenue: number }
    month: { count: number; revenue: number }
    employees: number
  }
  teaTypes: Array<{ name: string | null; count: number; revenue: number }>
  dailyTrend: Array<{ date: string; count: number }>
  deptBreakdown: Array<{ department: string | null; count: number }>
  topDrinkers: Array<{
    id: number | null
    name: string | null
    department: string | null
    count: number
  }>
  employees: Array<{ id: number; name: string; department: string | null }>
  availableTeaTypes: Array<{ id: number; name: string; price: string }>
}

const COLORS = ['#078bc8', '#19c7e5', '#075d91', '#60a5fa', '#818cf8', '#38bdf8']

export function DashboardClient({
  stats,
  teaTypes,
  dailyTrend,
  deptBreakdown,
  topDrinkers,
  employees,
  availableTeaTypes,
}: DashboardClientProps) {
  const pieData = teaTypes.map((t) => ({
    name: t.name || 'Unknown',
    value: t.count || 0,
  }))

  const trendData = dailyTrend.map((d) => ({
    date: d.date ? d.date.slice(5) : '',
    cups: d.count || 0,
  }))

  const deptData = deptBreakdown.map((d) => ({
    name: d.department || 'Unassigned',
    cups: d.count || 0,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Live consumption metrics, distribution and top drinkers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ManualTeaEntryDialog employees={employees} teaTypes={availableTeaTypes} compact />
          <Link
            href="/counter"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#102d20] hover:bg-[#184431] text-white rounded-xl shadow-sm transition-all"
          >
            <span>Open Counter Screen</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[24px] border border-emerald-900/10 bg-gradient-to-r from-[#103d34] via-[#10594f] to-[#1b6b5f] px-5 sm:px-7 py-5 text-white shadow-[0_18px_45px_-28px_rgba(5,55,47,0.9)]">
        <div className="absolute -right-12 -top-16 w-48 h-48 rounded-full border-[28px] border-white/5" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/12 border border-white/15 flex items-center justify-center shrink-0">
              <CalendarPlus className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold">Record a missed tea entry</h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">Add an entry for right now or select any previous day and time.</p>
            </div>
          </div>
          <ManualTeaEntryDialog employees={employees} teaTypes={availableTeaTypes} triggerLabel="Record Entry" compact />
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Today's Cups"
          value={stats.today.count}
          subtitle={`Total: ${formatBDT(stats.today.revenue)}`}
          icon={Coffee}
          color="emerald"
        />
        <StatsCard
          label="This Week"
          value={stats.week.count}
          subtitle={`Total: ${formatBDT(stats.week.revenue)}`}
          icon={TrendingUp}
          color="amber"
        />
        <StatsCard
          label="This Month"
          value={stats.month.count}
          subtitle={`Total: ${formatBDT(stats.month.revenue)}`}
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          label="Active Staff"
          value={stats.employees}
          subtitle="Employees registered"
          icon={Users}
          color="blue"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tea Type Split */}
        <div className="bg-white/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-5 shadow-xs">
          <h3 className="font-serif font-bold text-base text-gray-900 dark:text-zinc-100 mb-4">
            Tea Type Split (Today)
          </h3>
          {pieData.length === 0 || pieData.every((d) => d.value === 0) ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm">
              <Coffee className="w-8 h-8 opacity-40 mb-2" />
              <span>No tea recorded yet today</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 7-Day Trend */}
        <div className="bg-white/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-5 shadow-xs">
          <h3 className="font-serif font-bold text-base text-gray-900 dark:text-zinc-100 mb-4">
            7-Day Consumption Trend
          </h3>
          {trendData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm">
              <TrendingUp className="w-8 h-8 opacity-40 mb-2" />
              <span>No consumption data in the last 7 days</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="cups" fill="#078bc8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Top Drinkers & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Drinkers */}
        <div className="bg-white/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-zinc-100">
              Top Drinkers (This Month)
            </h3>
            <Link
              href="/admin/reports/monthly"
              className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
            >
              View Full Matrix
            </Link>
          </div>

          {topDrinkers.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No consumption recorded this month
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-700/60">
              {topDrinkers.map((drinker, idx) => (
                <div key={drinker.id || idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-xs text-gray-400">
                      #{idx + 1}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs ${getAvatarColor(
                        drinker.name || 'Staff'
                      )}`}
                    >
                      {getInitials(drinker.name || 'Staff')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                        {drinker.name || 'Staff Member'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500">
                        {drinker.department || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs px-2.5 py-1 rounded-full">
                    {drinker.count} cups
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Department Consumption */}
        <div className="bg-white/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 rounded-2xl p-5 shadow-xs">
          <h3 className="font-serif font-bold text-base text-gray-900 dark:text-zinc-100 mb-4">
            Department-wise Consumption (Today)
          </h3>
          {deptData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm">
              <Users className="w-8 h-8 opacity-40 mb-2" />
              <span>No department data today</span>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="cups" fill="#19a9cf" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
