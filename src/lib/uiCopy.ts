import type { User } from './types'

export function dashboardEyebrow(role: User['role']): string {
  if (role === 'admin') return 'Admin Analytics'
  if (role === 'manager') return 'Manager Analytics'
  return 'My Performance'
}

export function dashboardTitle(role: User['role']): string {
  if (role === 'admin') return 'Team Overview Dashboard'
  if (role === 'manager') return 'Team Comparative Dashboard'
  return 'Personal Sales Dashboard'
}

export function dashboardSubtitle(role: User['role']): string {
  if (role === 'admin') {
    return 'View all team performance from each employee\'s latest real sheet. Upload, review history, and delete incorrect sheets when needed.'
  }
  if (role === 'manager') {
    return 'Compare team performance from each employee\'s latest real sheet. You can upload your own data or delete incorrect team uploads from history.'
  }
  return 'Your charts and KPIs always use your latest real uploaded sheet.'
}

export function dashboardEmptyMessage(role: User['role']): string {
  if (role === 'admin') {
    return 'No sales data yet. Ask the sales team to upload their Excel files, or upload a sheet from the Upload page.'
  }
  if (role === 'manager') {
    return 'No team sales data yet. Ask sales team members to upload their files, or upload a sheet yourself from the Upload page.'
  }
  return 'Upload the CyberSecurity Sales template from the Upload page to see your charts.'
}

export function uploadHistoryTitle(role: User['role']): string {
  if (role === 'admin' || role === 'manager') return 'Team Upload History'
  return 'Your Upload History'
}

export function uploadPageDescription(role: User['role']): string {
  if (role === 'admin') {
    return 'Upload a sales sheet for your account. Every upload is saved in history — new data becomes Latest, and the same file is marked Duplicate.'
  }
  if (role === 'manager') {
    return 'Upload your sales sheet here. Every upload is saved in history — new data becomes Latest, and the same file is marked Duplicate.'
  }
  return 'Upload your sales sheet. Every upload is kept in history — new data becomes Latest, and the same file is saved as Duplicate.'
}

export function deleteUploadConfirm(upload: {
  fileName: string
  userName: string
  status: string
}): string {
  const base = `Delete "${upload.fileName}" uploaded by ${upload.userName}?`
  if (upload.status === 'latest') {
    return `${base}\n\nThis is their Latest sheet. The previous real sheet will be restored on the dashboard if one exists.`
  }
  return `${base}\n\nThis removes the sheet from history only. Dashboard data will not change.`
}
