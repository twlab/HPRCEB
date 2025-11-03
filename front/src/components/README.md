# Components Directory

This directory contains all React components for the HPRC Epigenome Navigator.

## Component Hierarchy

```
App.tsx (root)
│
├─── Header.tsx
│     └─ Displays logo and title
│
├─── TabNavigation.tsx
│     └─ Manages tab switching
│
├─── Content (based on active tab)
│     │
│     ├─── DataAvailabilityMatrix.tsx
│     │     └─ Shows data availability table
│     │
│     ├─── DataSelector.tsx (main)
│     │     ├─ StatsCards.tsx
│     │     │   └─ 4 statistics cards
│     │     │
│     │     ├─ GenomeSelection.tsx
│     │     │   ├─ Search input
│     │     │   ├─ Population filter
│     │     │   └─ Genome list
│     │     │
│     │     ├─ DataLayerSelection.tsx
│     │     │   └─ 3 data layer cards
│     │     │
│     │     ├─ DataVisualization.tsx
│     │     │   ├─ Table view
│     │     │   └─ Chart view
│     │     │
│     │     └─ BrowserPlaceholder.tsx
│     │         └─ Placeholder for genome browser
│     │
│     └─── Tutorials.tsx
│           └─ Documentation and guides
│
└─── Footer.tsx
      └─ Footer with links
```

## Component Quick Reference

### Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| Header | Header.tsx | App header with logo |
| TabNavigation | TabNavigation.tsx | Tab switching UI |
| Footer | Footer.tsx | App footer |

### Tab Components

| Component | File | Purpose |
|-----------|------|---------|
| DataAvailabilityMatrix | DataAvailabilityMatrix.tsx | Data matrix tab |
| DataSelector | DataSelector.tsx | Main selector tab |
| Tutorials | Tutorials.tsx | Tutorials tab |

### Data Selector Sub-Components

| Component | File | Purpose |
|-----------|------|---------|
| StatsCards | StatsCards.tsx | Statistics summary |
| GenomeSelection | GenomeSelection.tsx | Genome picker panel |
| DataLayerSelection | DataLayerSelection.tsx | Data layer cards |
| DataVisualization | DataVisualization.tsx | Table/chart display |
| BrowserPlaceholder | BrowserPlaceholder.tsx | Browser placeholder |

## Props and State

### Header
```typescript
// No props - static component
```

### TabNavigation
```typescript
interface TabNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}
```

### DataSelector
```typescript
interface DataSelectorState {
  selectedGenomes: string[];
  selectedLayers: DataLayer[];
  searchTerm: string;
  populationFilter: string;
  referenceGenome: string;
}
```

### StatsCards
```typescript
interface StatsCardsProps {
  totalGenomes: number;
  selectedGenomes: number;
  dataLayers: number;
  totalSize: number;
}
```

### GenomeSelection
```typescript
interface GenomeSelectionProps {
  searchTerm: string;
  populationFilter: string;
  selectedGenomes: string[];
  onSearchChange: (term: string) => void;
  onPopulationFilterChange: (filter: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onGenomeToggle: (genomeId: string) => void;
}
```

### DataLayerSelection
```typescript
interface DataLayerSelectionProps {
  selectedLayers: DataLayer[];
  onLayerToggle: (layer: DataLayer) => void;
}
```

### DataVisualization
```typescript
interface DataVisualizationProps {
  selectedGenomes: string[];
  selectedLayers: DataLayer[];
}
```

## Styling

All components use Tailwind CSS classes. Key utility classes:

- **Layout**: `flex`, `grid`, `max-w-7xl`, `mx-auto`
- **Spacing**: `p-6`, `mb-4`, `gap-3`
- **Colors**: `bg-white`, `text-gray-900`, `border-gray-200`
- **Effects**: `rounded-2xl`, `shadow-fancy`, `hover:shadow-lg`
- **Gradients**: `bg-gradient-to-br`, `from-blue-500`, `to-purple-600`
- **Animations**: `animate-fade-in-up`, `hover-lift`, `transition-all`

## State Management

### Local State (useState)
- Used in individual components for UI state
- Example: `currentView` in DataVisualization

### Lifted State
- Shared state lives in parent components
- Passed down via props
- Example: `selectedGenomes` managed in DataSelector

### Event Handlers
- Functions passed as props for child-to-parent communication
- Example: `onGenomeToggle` callback

## Effects (useEffect)

### DataAvailabilityMatrix
- Renders matrix when component mounts
- Re-runs when data changes

### GenomeSelection
- Sets up event delegation for checkboxes
- Updates list when filters change
- Cleanup on unmount

### DataLayerSelection
- Updates visual states when selection changes

### DataVisualization
- Switches between table/chart views
- Updates when selections change

## Best Practices

1. **Single Responsibility**: Each component does one thing well
2. **Props Interface**: Always define TypeScript interfaces for props
3. **Composition**: Build complex UIs from simple components
4. **Hooks**: Use useState and useEffect appropriately
5. **Event Delegation**: For dynamic lists (GenomeSelection)
6. **Refs**: Use useRef for DOM access (genomeListRef)
7. **Cleanup**: Remove event listeners in useEffect cleanup

## Adding New Components

1. Create new `.tsx` file in this directory
2. Define props interface if needed
3. Implement component function
4. Export as default
5. Import and use in parent component
6. Update this README

Example:
```typescript
interface MyComponentProps {
  data: string;
  onAction: () => void;
}

export default function MyComponent({ data, onAction }: MyComponentProps) {
  return (
    <div className="p-4">
      {data}
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

## Testing Components

Use Vitest and React Testing Library:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent data="test" onAction={() => {}} />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

## Performance Considerations

1. **Memoization**: Use `React.memo` for expensive components
2. **Callbacks**: Use `useCallback` for event handlers
3. **Effects**: Minimize useEffect dependencies
4. **Lists**: Always use `key` prop in lists
5. **Lazy Loading**: Consider code splitting for large components

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast compliance


