import { UserAvailability } from './supabase';

/**
 * 时间处理工具函数
 */

/**
 * 解析时间字符串为分钟数
 * @param time HH:MM 格式的时间字符串
 * @returns 从00:00开始的分钟数
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 将分钟数转换为时间字符串
 * @param minutes 从00:00开始的分钟数
 * @returns HH:MM 格式的时间字符串
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 给时间增加分钟数
 * @param time HH:MM 格式的时间字符串
 * @param minutesToAdd 要增加的分钟数
 * @returns 新的时间字符串
 */
export function addMinutes(time: string, minutesToAdd: number): string {
  const totalMinutes = parseTimeToMinutes(time) + minutesToAdd;
  return minutesToTimeString(totalMinutes);
}

/**
 * 检查两个时间段是否冲突
 * @param start1 时间段1开始时间
 * @param duration1 时间段1持续时间（分钟）
 * @param start2 时间段2开始时间
 * @param duration2 时间段2持续时间（分钟）
 * @returns 是否冲突
 */
export function hasTimeOverlap(
  start1: string,
  duration1: number,
  start2: string,
  duration2: number
): boolean {
  const start1Minutes = parseTimeToMinutes(start1);
  const end1Minutes = start1Minutes + duration1;
  const start2Minutes = parseTimeToMinutes(start2);
  const end2Minutes = start2Minutes + duration2;

  return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
}

/**
 * 检查新时间段是否与现有时间段冲突
 * @param date 日期
 * @param time 时间
 * @param duration 持续时间（分钟）
 * @param existingSlots 已存在的时间段列表
 * @returns 是否有冲突
 */
export function hasTimeConflict(
  date: string,
  time: string,
  duration: number,
  existingSlots: UserAvailability[]
): boolean {
  return existingSlots.some(slot => {
    // 只检查同一天的时间段
    if (slot.date !== date) return false;
    
    return hasTimeOverlap(time, duration, slot.time_slot, slot.duration);
  });
}

/**
 * 生成所有可用的时间选项（每半小时一个）
 * @returns 时间选项数组 ['00:00', '00:30', '01:00', ...]
 */
export function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      options.push(minutesToTimeString(hour * 60 + minute));
    }
  }
  return options;
}

/**
 * 生成固定的可用时间选项
 * @returns 固定时间选项数组 ['09:00', '11:00', '13:00', '17:00', '19:00', '20:00', '21:00', '22:00']
 */
export function generateFixedTimeOptions(): string[] {
  return ['09:00', '11:00', '13:00', '17:00', '19:00', '20:00', '21:00', '22:00'];
}

/**
 * 时间段类型定义
 */
export type TimePeriod = 'MORNING' | 'NOON' | 'AFTERNOON' | 'EVENING';

/**
 * 时间段到具体时间的映射
 */
export const TIME_PERIOD_MAP: Record<TimePeriod, string[]> = {
  MORNING: ['09:00', '11:00'],
  NOON: ['12:00', '13:00'],
  AFTERNOON: ['17:00','18:00'],
  EVENING: ['19:00', '20:00', '21:00', '22:00'],
};

/**
 * 时间段显示名称
 */
export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  MORNING: 'Morning',
  NOON: 'Noon',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
};

/**
 * 时间段图标
 */
export const TIME_PERIOD_ICONS: Record<TimePeriod, string> = {
  MORNING: '',
  NOON: '',
  AFTERNOON: '',
  EVENING: '',
};

/**
 * 获取时间段的初始推荐时间（中间时间）
 * @param period 时间段
 * @returns 推荐的时间
 */
export function getInitialTimeForPeriod(period: TimePeriod): string {
  const times = TIME_PERIOD_MAP[period];
  // 返回中间的时间
  const middleIndex = Math.floor(times.length / 2);
  return times[middleIndex];
}

/**
 * 获取时间段中的下一个时间
 * @param period 时间段
 * @param currentTime 当前时间
 * @returns 下一个时间，如果没有则返回 null
 */
export function getNextTimeInPeriod(period: TimePeriod, currentTime: string): string | null {
  const times = TIME_PERIOD_MAP[period];
  const currentIndex = times.indexOf(currentTime);
  if (currentIndex === -1 || currentIndex === times.length - 1) {
    return null;
  }
  return times[currentIndex + 1];
}

/**
 * 获取时间段中的上一个时间
 * @param period 时间段
 * @param currentTime 当前时间
 * @returns 上一个时间，如果没有则返回 null
 */
export function getPreviousTimeInPeriod(period: TimePeriod, currentTime: string): string | null {
  const times = TIME_PERIOD_MAP[period];
  const currentIndex = times.indexOf(currentTime);
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }
  return times[currentIndex - 1];
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param date Date 对象
 * @returns YYYY-MM-DD 格式的字符串
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 解析日期字符串为 Date 对象
 * @param dateString YYYY-MM-DD 格式的字符串
 * @returns Date 对象
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

/**
 * 检查日期是否是今天或未来
 * @param dateString YYYY-MM-DD 格式的字符串
 * @returns 是否是今天或未来
 */
export function isTodayOrFuture(dateString: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = parseDate(dateString);
  return targetDate >= today;
}

/**
 * 格式化显示日期和时间
 * @param date YYYY-MM-DD
 * @param time HH:MM
 * @param duration 持续时间（分钟）
 * @returns 格式化的字符串，如 "2025-10-21 10:00 (15分钟)"
 */
export function formatDateTime(date: string, time: string, duration: number): string {
  return `${date} ${time} (${duration}分钟)`;
}

/**
 * 获取友好的日期显示
 * @param dateString YYYY-MM-DD
 * @returns 友好的日期字符串，如 "今天", "明天", "2025年10月21日"
 */
export function getFriendlyDate(dateString: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = parseDate(dateString);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays === 2) return '后天';
  
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  
  return `${year}年${month}月${day}日`;
}

/**
 * 获取星期几
 * @param dateString YYYY-MM-DD
 * @returns 星期几的字符串
 */
export function getWeekday(dateString: string): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = parseDate(dateString);
  return weekdays[date.getDay()];
}

/**
 * 完整的日期时间显示
 * @param date YYYY-MM-DD
 * @param time HH:MM
 * @param duration 持续时间（分钟）
 * @returns 如 "今天 10:00-10:15 (15分钟)"
 */
export function formatFullDateTime(date: string, time: string, duration: number): string {
  const friendlyDate = getFriendlyDate(date);
  const weekday = getWeekday(date);
  const endTime = addMinutes(time, duration);
  
  return `${friendlyDate} (${weekday}) ${time}-${endTime}`;
}

/**
 * 检查时间是否已过期
 * @param date YYYY-MM-DD
 * @param time HH:MM
 * @returns 是否已过期
 */
export function isPastTime(date: string, time: string): boolean {
  const now = new Date();
  const targetDateTime = new Date(`${date}T${time}:00`);
  return targetDateTime < now;
}

/**
 * 按日期分组时间段
 * @param slots 时间段数组
 * @returns 按日期分组的对象
 */
export function groupByDate(slots: UserAvailability[]): Record<string, UserAvailability[]> {
  return slots.reduce((groups, slot) => {
    const date = slot.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {} as Record<string, UserAvailability[]>);
}

/**
 * 排序时间段（按日期和时间）
 * @param slots 时间段数组
 * @returns 排序后的数组
 */
export function sortTimeSlots(slots: UserAvailability[]): UserAvailability[] {
  return [...slots].sort((a, b) => {
    // 先按日期排序
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // 再按时间排序
    return a.time_slot.localeCompare(b.time_slot);
  });
}

