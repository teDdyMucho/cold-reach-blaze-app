// This file has been removed as part of the template editor integration.
// The functionality has been replaced by the new template editor components.

import React from "react";

interface SimpleAnimationEditorProps {
  onSave: (gifUrl: string) => void;
  onCancel: () => void;
}

const SimpleAnimationEditor: React.FC<SimpleAnimationEditorProps> = ({ onSave, onCancel }) => {
  // This is a placeholder component that maintains the interface but has no functionality
  return (
    <div className="text-center p-8">
      <p>This component has been deprecated and replaced by the new template editor.</p>
      <button onClick={() => onCancel()} className="mt-4 px-4 py-2 bg-gray-200 rounded">
        Close
      </button>
    </div>
  );
};

export default SimpleAnimationEditor;
