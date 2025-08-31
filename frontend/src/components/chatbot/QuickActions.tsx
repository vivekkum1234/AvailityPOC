import React from 'react';
import { QuickAction } from './chatbot.types';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, onActionClick }) => {
  return (
    <div className="px-4 py-3">
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action)}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            {action.icon && (
              <span className="text-availity-500">{action.icon}</span>
            )}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
