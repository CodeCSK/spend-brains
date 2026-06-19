export { ApiError, apiFetch, apiFetchBlob } from './client'
export type { ApiFetchOptions } from './client'

export { sendOtp, verifyOtp, refreshSession, logout } from './auth'
export { getMe, updateMe } from './users'
export type { UpdateMePayload } from './users'

export {
  approveJoinRequest,
  archiveEvent,
  createEvent,
  deleteEvent,
  getEvent,
  joinEvent,
  listEvents,
  listJoinRequests,
  lookupEvent,
  rejectJoinRequest,
  unarchiveEvent,
  updateEvent,
} from './events'
export type {
  CreateEventPayload,
  JoinRequestActionResult,
  ListEventsOptions,
  UpdateEventPayload,
} from './events'

export { addMember, listMembers, removeMember, updateMemberRole } from './members'
export type { AddMemberPayload, UpdateMemberRolePayload } from './members'

export {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from './categories'
export type { CreateCategoryPayload, UpdateCategoryPayload } from './categories'

export {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense,
} from './expenses'
export type { CreateExpensePayload, UpdateExpensePayload } from './expenses'

export {
  exportSettlement,
  getMemberSummaries,
  getSettlements,
  settleLine,
  unsettleLine,
} from './settlements'
