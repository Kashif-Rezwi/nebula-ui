interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    {
      icon: '💡',
      title: 'Explain concepts',
      description: 'Break down complex topics into simple explanations',
      prompt: 'Explain a complex topic in simple terms',
    },
    {
      icon: '🎨',
      title: 'Brainstorm ideas',
      description: 'Generate creative ideas and solutions',
      prompt: 'Help me brainstorm ideas for',
    },
    {
      icon: '💻',
      title: 'Write code',
      description: 'Help with programming and debugging',
      prompt: 'Write code to',
    },
    {
      icon: '📊',
      title: 'Analyze data',
      description: 'Break down and summarize information',
      prompt: 'Analyze and summarize',
    },
  ];

  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/dev-logo-light.png" alt="better DEV Logo" className="w-12 h-12 object-contain mr-3" />
            <h2 className="text-2xl sm:text-3xl font-semibold">Welcome back!</h2>
          </div>
          <p className="text-foreground/60 text-lg">How can I help you today?</p>
        </div>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.title}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="text-left p-4 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all hover:bg-surface-hover group"
            >
              <div className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">
                {suggestion.icon} {suggestion.title}
              </div>
              <div className="text-xs text-foreground/60">{suggestion.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}