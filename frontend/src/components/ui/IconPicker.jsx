import { useState } from 'react';
import * as Icons from 'lucide-react';
import { ICON_CATEGORIES } from '../../utils/iconRegistry';

/**
 * IconPicker - 图标选择器组件
 * 允许用户从预定义的图标列表中选择一个图标
 */
export default function IconPicker({ value, onChange }) {
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(ICON_CATEGORIES)[0]);

  const handleIconSelect = (iconName) => {
    onChange(iconName);
  };

  const handleClearIcon = () => {
    onChange(null);
  };

  const currentCategory = ICON_CATEGORIES[selectedCategory];
  const SelectedIcon = value ? Icons[value] : null;

  return (
    <div className="space-y-3">
      {/* 当前选中的图标 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg border-2 border-gray-300 bg-gray-50">
          {SelectedIcon ? (
            <SelectedIcon className="w-6 h-6 text-gray-700" />
          ) : (
            <span className="text-xs text-gray-400">无</span>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={handleClearIcon}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            清除图标
          </button>
        )}
      </div>

      {/* 类别选择 */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ICON_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selectedCategory === key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* 图标网格 */}
      <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
        {currentCategory.icons.map((icon) => {
          const IconComponent = Icons[icon.name];
          const isSelected = value === icon.name;

          return (
            <button
              key={icon.name}
              type="button"
              onClick={() => handleIconSelect(icon.name)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                isSelected
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              title={icon.label}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs mt-1 truncate w-full text-center">
                {icon.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
