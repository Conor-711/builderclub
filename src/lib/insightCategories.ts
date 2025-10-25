import { InsightCategory } from './supabase';

export interface CategoryInfo {
  label: string;
  color: string;
  icon: string;
}

export const INSIGHT_CATEGORIES: Record<InsightCategory, CategoryInfo> = {
  business_opportunity: {
    label: '商业机会',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: '💼'
  },
  learning_point: {
    label: '学习要点',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: '📚'
  },
  networking_resource: {
    label: '人脉资源',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: '🤝'
  },
  industry_insight: {
    label: '行业洞察',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    icon: '🔍'
  },
  action_item: {
    label: '行动建议',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: '✅'
  }
};

export function getCategoryInfo(category?: InsightCategory): CategoryInfo {
  if (!category) {
    return {
      label: '未分类',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      icon: '📝'
    };
  }
  return INSIGHT_CATEGORIES[category] || INSIGHT_CATEGORIES.learning_point;
}

