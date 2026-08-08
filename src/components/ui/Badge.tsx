import type { ReactNode } from 'react'
import type { AppointmentStatus } from '../../api/types'

interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'blue'
  children: ReactNode
  className?: string
}

const styles: Record<BadgeProps['variant'], string> = {
  success: 'bg-[#d1fae5] text-[#047857]',
  warning: 'bg-[#fef3c7] text-[#b45309]',
  danger: 'bg-[#fee2e2] text-[#dc2626]',
  info: 'bg-[#e0e7ff] text-[#3730a3]',
  neutral: 'bg-[#e2e8f0] text-[#475569]',
  blue: 'bg-[#dbeafe] text-[#1d4ed8]',
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-[11px] py-1 rounded-full text-xs font-semibold whitespace-nowrap ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

const statusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Agendada',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
}

const statusVariants: Record<AppointmentStatus, BadgeProps['variant']> = {
  SCHEDULED: 'info',
  CONFIRMED: 'blue',
  CANCELLED: 'danger',
  COMPLETED: 'success',
}

export function appointmentStatusBadge(status: AppointmentStatus) {
  return <Badge variant={statusVariants[status] ?? 'neutral'}>{statusLabels[status] ?? status}</Badge>
}
