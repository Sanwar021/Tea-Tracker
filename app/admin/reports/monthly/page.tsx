import { getMonthlyMatrix } from '@/lib/actions/reports'
import { MonthlyMatrixClient } from './MonthlyMatrixClient'

export const dynamic = 'force-dynamic'

export default async function MonthlyReportPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string }
}) {
  const now = new Date()
  const year = Number(searchParams.year) || now.getFullYear()
  const month = Number(searchParams.month) || now.getMonth() + 1

  const data = await getMonthlyMatrix(year, month)

  return (
    <MonthlyMatrixClient
      initialMatrix={data.matrix}
      daysInMonth={data.daysInMonth}
      currentYear={year}
      currentMonth={month}
    />
  )
}

