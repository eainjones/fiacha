// Political Party Types

export interface PoliticalParty {
  id: number;
  name: string;
  abbreviation: string;
  color: string;          // Hex color for badges/backgrounds
  text_color: string;     // Contrast text color
  icon_url?: string | null;
  description?: string | null;
  active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface PartyBadgeProps {
  party: PoliticalParty | null;
  showIcon?: boolean;
  showFullName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface PartySelectorProps {
  value?: number | null;
  onChange: (partyId: number | null) => void;
  parties: PoliticalParty[];
  required?: boolean;
  className?: string;
  showPreview?: boolean;
}

export interface PartyFilterProps {
  value: string | number;
  onChange: (value: string | number) => void;
  parties: PoliticalParty[];
  showIcons?: boolean;
  allowMultiple?: boolean;
}
