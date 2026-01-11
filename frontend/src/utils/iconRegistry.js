/**
 * Icon Registry - 定义可用的 Lucide 图标
 * 按类别组织常用图标，用于习惯追踪
 */

export const ICON_CATEGORIES = {
  fitness: {
    label: '运动健身',
    icons: [
      { name: 'Activity', label: '活动' },
      { name: 'Dumbbell', label: '哑铃' },
      { name: 'Bike', label: '骑行' },
      { name: 'PersonStanding', label: '跑步' },
      { name: 'Footprints', label: '步行' },
      { name: 'Waves', label: '游泳' },
    ],
  },
  learning: {
    label: '学习成长',
    icons: [
      { name: 'Book', label: '阅读' },
      { name: 'BookOpen', label: '学习' },
      { name: 'GraduationCap', label: '教育' },
      { name: 'Lightbulb', label: '创意' },
      { name: 'Brain', label: '思考' },
      { name: 'Pencil', label: '写作' },
    ],
  },
  health: {
    label: '健康生活',
    icons: [
      { name: 'Heart', label: '健康' },
      { name: 'Apple', label: '饮食' },
      { name: 'Tablets', label: '用药' },
      { name: 'Moon', label: '睡眠' },
      { name: 'Droplet', label: '喝水' },
      { name: 'Smile', label: '心情' },
    ],
  },
  work: {
    label: '工作效率',
    icons: [
      { name: 'Briefcase', label: '工作' },
      { name: 'Code', label: '编程' },
      { name: 'Target', label: '目标' },
      { name: 'CheckSquare', label: '任务' },
      { name: 'Calendar', label: '日程' },
      { name: 'Clock', label: '时间' },
    ],
  },
  lifestyle: {
    label: '生活习惯',
    icons: [
      { name: 'Coffee', label: '咖啡' },
      { name: 'Music', label: '音乐' },
      { name: 'Camera', label: '摄影' },
      { name: 'Palette', label: '艺术' },
      { name: 'Home', label: '家务' },
      { name: 'Sparkles', label: '整理' },
    ],
  },
};

/**
 * 获取所有图标的扁平列表
 */
export function getAllIcons() {
  const icons = [];
  Object.values(ICON_CATEGORIES).forEach((category) => {
    icons.push(...category.icons);
  });
  return icons;
}

/**
 * 根据名称查找图标
 */
export function findIconByName(name) {
  const allIcons = getAllIcons();
  return allIcons.find((icon) => icon.name === name);
}
