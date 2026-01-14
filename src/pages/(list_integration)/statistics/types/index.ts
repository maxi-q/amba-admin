export interface EventData {
  id: string;
  name: string;
  event: string;
  date: string;
}

export interface ChartData {
  date: string;
  count: number;
}

export interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

export interface FilterSelectorProps {
  selectedAmbassadors: string[];
  selectedSprints: string[];
  selectedEvents: string[];
  onAmbassadorsChange: (ids: string[]) => void;
  onSprintsChange: (ids: string[]) => void;
  onEventsChange: (ids: string[]) => void;
}

export interface EventChartProps {
  data: ChartData[];
}

export interface EventListProps {
  events: EventData[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isLoading?: boolean;
  total?: number;
}

export interface AutocompleteOption {
  id: string;
  label: string;
}

export interface AmbassadorAutocompleteProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export interface SprintAutocompleteProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  roomId: string;
}

export interface EventAutocompleteProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  roomId: string;
}