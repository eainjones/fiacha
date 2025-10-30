# Political Party Icons UI - Recommendations

## Current State Analysis

### What Currently Exists
- **Party Storage**: Plain text field (`VARCHAR(100)`) in politicians table
- **Party Display**: Generic blue badges with no visual differentiation
- **Party Assignment**: Simple text input with no validation
- **Party Filtering**: Dynamic dropdown generated from existing data
- **No Icons**: No visual branding or party-specific imagery

### Main Display Locations
1. `/politicians` - Full table view with party column
2. `/` (Home) - Politician preview table
3. `/promises` - Promise cards showing politician/party info
4. `/promises/[id]` - Promise detail page with politician info
5. `/add` - Form for adding politicians

---

## Recommended UI Tweaks

### 1. **Party Management Admin Interface** (New)

#### Create `/admin/parties` page
**Purpose**: Central location to manage party icons, colors, and metadata

**Components Needed**:
- `PartyManagementTable.tsx` - List all parties with edit/delete actions
- `PartyForm.tsx` - Add/edit party details

**Fields**:
```typescript
interface PoliticalParty {
  id: number;
  name: string;           // e.g., "Fianna Fáil"
  abbreviation: string;   // e.g., "FF"
  color: string;          // Hex color for badges/backgrounds
  textColor: string;      // Contrast text color
  iconUrl?: string;       // Path to uploaded icon/logo
  description?: string;
  active: boolean;
  displayOrder: number;
}
```

**UI Features**:
- Upload button for party logo/icon (SVG/PNG, max 200KB)
- Color picker for primary party color
- Auto-calculate contrast text color
- Preview badge with icon before saving
- Drag-to-reorder party display order
- Bulk import from existing party names in politicians table

**Mockup Structure**:
```
┌─────────────────────────────────────────────────────────┐
│ Political Parties Management          [+ Add New Party] │
├─────────────────────────────────────────────────────────┤
│ Party Name    | Icon | Color | Active | Actions         │
├─────────────────────────────────────────────────────────┤
│ Fianna Fáil   | 🟢   | #66BB6A | ✓    | Edit | Delete   │
│ Fine Gael     | 🔵   | #2196F3 | ✓    | Edit | Delete   │
│ Sinn Féin     | 🟢   | #326634 | ✓    | Edit | Delete   │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘
```

---

### 2. **Party Assignment UI** (Update `/app/add/page.tsx`)

#### Replace Text Input with Enhanced Dropdown

**Current Code** (line ~115):
```tsx
<input
  type="text"
  id="party"
  name="party"
  className="w-full px-4 py-2 border..."
/>
```

**Recommended Change**:
```tsx
<select
  id="party"
  name="party"
  className="w-full px-4 py-2 border border-gray-300 rounded-md"
>
  <option value="">Select a party...</option>
  {parties.map(party => (
    <option key={party.id} value={party.id}>
      {party.abbreviation} - {party.name}
    </option>
  ))}
</select>
```

**Enhanced Version** (Custom Dropdown Component):
Create `PartySelector.tsx`:

```tsx
interface PartySelectorProps {
  value?: number;
  onChange: (partyId: number) => void;
}

// Features:
// - Searchable dropdown
// - Shows party icon + name
// - Preview selected party badge
// - Option for "Independent" (no party)
```

**UI Features**:
- **Icon Preview**: Show party icon next to each option
- **Color Preview**: Display party color as a small circle
- **Search/Filter**: Type to filter party names (for large lists)
- **Selected Badge Preview**: Show how the badge will appear
- **"Independent" Option**: Special case for independent politicians

**Visual Layout**:
```
┌────────────────────────────────────────┐
│ Political Party *                      │
├────────────────────────────────────────┤
│ [🟢] Fianna Fáil (FF)             [▼] │
├────────────────────────────────────────┤
│ Preview:                               │
│ ┌────────────────────┐                 │
│ │ 🟢 Fianna Fáil     │                 │
│ └────────────────────┘                 │
└────────────────────────────────────────┘
```

---

### 3. **Party Display in Lists** (Update Components)

#### PoliticiansList.tsx (line 153)

**Current Badge** (Generic Blue):
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
  {pol.party}
</span>
```

**Recommended Badge** (Party-Specific):
```tsx
<PartyBadge party={pol.partyDetails} />
```

Create `PartyBadge.tsx`:
```tsx
interface PartyBadgeProps {
  party: PoliticalParty;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showFullName?: boolean;
}

// Features:
// - Display party icon (if available)
// - Use party-specific colors
// - Show abbreviation or full name
// - Responsive sizing
// - Fallback for "Independent" (neutral gray)
```

**Visual Examples**:

```
Small:  [🟢 FF]

Medium: [🟢 Fianna Fáil]

Large:  [🟢 Fianna Fáil - FF]
```

**Party-Specific Colors** (Irish parties):
- Fianna Fáil: Green (#66BB6A or similar)
- Fine Gael: Blue (#2196F3)
- Sinn Féin: Dark Green (#326634)
- Labour: Red (#E53935)
- Social Democrats: Purple (#8E24AA)
- People Before Profit: Red/Orange (#FF6F00)
- Green Party: Green (#4CAF50)
- Independents: Gray (#757575)

---

### 4. **Politicians Table View** (Enhance Display)

#### Add Icon Column

**Current Table Structure** (PoliticiansList.tsx):
```
| Name | Party | Constituency | County | ... |
```

**Recommended Enhancement**:

**Option A**: Icon in Party Column
```
| Name | Party Badge (with icon) | Constituency | ... |
```

**Option B**: Separate Icon Column (More Visual)
```
| Icon | Name | Party | Constituency | ... |
|  🟢  | Mary Lou McDonald | Sinn Féin | Dublin Central | ... |
```

**Recommendation**: Option A (icon embedded in badge) for cleaner layout

#### Row Hover Effect
- Show full party name on hover if only abbreviation is shown
- Slight color change to party badge background

---

### 5. **Promise Views** (Update Display)

#### Promise Cards (`PromisesList.tsx`)

**Current Display** (lines ~180-200):
```tsx
<div className="text-sm text-gray-600">
  by {promise.politician_name} ({promise.party})
</div>
```

**Recommended**:
```tsx
<div className="flex items-center gap-2 text-sm">
  <span className="text-gray-600">by {promise.politician_name}</span>
  <PartyBadge party={promise.partyDetails} size="sm" showIcon />
</div>
```

#### Promise Detail Page (`/app/promises/[id]/page.tsx`)

**Current** (line 90):
```tsx
<div>
  <span className="text-gray-600">Party:</span>
  <span className="font-medium">{promise.party}</span>
</div>
```

**Recommended**:
```tsx
<div className="flex items-center gap-2">
  <span className="text-gray-600">Party:</span>
  <PartyBadge party={promise.partyDetails} size="md" showIcon showFullName />
</div>
```

---

### 6. **Party Filter UI** (Enhanced Filtering)

#### PoliticiansList Filter (lines 80-90)

**Current**: Plain dropdown
```tsx
<select value={selectedParty} onChange={handlePartyChange}>
  <option value="">All Parties</option>
  {uniqueParties.map(party => (
    <option key={party} value={party}>{party}</option>
  ))}
</select>
```

**Recommended**: Icon-enhanced dropdown
```tsx
<PartyFilterDropdown
  value={selectedParty}
  onChange={handlePartyChange}
  parties={parties}
  showIcons={true}
/>
```

**Features**:
- Show party icon next to name in dropdown
- Color-code options (subtle background tint)
- Multi-select option for filtering by multiple parties
- "Major Parties" quick filter group

**Visual**:
```
┌─────────────────────────────────┐
│ Filter by Party            [▼] │
├─────────────────────────────────┤
│ ☐ All Parties                   │
│ ☐ 🟢 Fianna Fáil                │
│ ☐ 🔵 Fine Gael                  │
│ ☐ 🟢 Sinn Féin                  │
│ ☐ 🔴 Labour                     │
│ ☐ ⚪ Independent                │
└─────────────────────────────────┘
```

---

### 7. **Icon Upload & Management** (Admin Feature)

#### Icon Upload Component (`PartyIconUpload.tsx`)

**Features**:
- Drag-and-drop file upload
- Support SVG (preferred), PNG, JPG
- Auto-resize to standard dimensions (e.g., 64x64px)
- Preview before saving
- Replace/delete existing icon
- Icon library fallback (select from preset icons)

**UI Flow**:
```
┌────────────────────────────────────────┐
│ Party Icon                             │
├────────────────────────────────────────┤
│  ┌──────────────┐                      │
│  │              │                      │
│  │   Drop icon  │  or [Choose File]   │
│  │     here     │                      │
│  │              │                      │
│  └──────────────┘                      │
│                                        │
│  Formats: SVG, PNG, JPG (max 200KB)   │
│                                        │
│  Or choose from library:               │
│  [ 🟢 ] [ 🔵 ] [ 🔴 ] [ ⚪ ] ...      │
└────────────────────────────────────────┘
```

**Storage Options**:
1. **Upload to `/public/party-icons/`** - Store icons as static files
2. **Database BLOB** - Store icon data in database
3. **External CDN** - Upload to cloud storage (S3, Cloudinary)

**Recommendation**: Option 1 (public folder) for simplicity, or Option 3 for production scale

---

### 8. **Responsive Design Considerations**

#### Mobile View Adjustments

**Party Badges**:
- Use abbreviations only on mobile (< 640px)
- Reduce icon size on mobile
- Stack party info vertically in cards

**Filter Dropdowns**:
- Full-width on mobile
- Bottom sheet/modal for multi-select

**Party Management**:
- Card layout instead of table on mobile
- Simplified edit forms

---

## Database Schema Changes Required

### New Table: `political_parties`

```sql
CREATE TABLE political_parties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  abbreviation VARCHAR(20) NOT NULL,
  color VARCHAR(7) NOT NULL,           -- Hex color #RRGGBB
  text_color VARCHAR(7) NOT NULL,      -- Contrast text color
  icon_url VARCHAR(500),               -- Path to icon file
  description TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Update `politicians` Table

```sql
ALTER TABLE politicians
  ADD COLUMN party_id INTEGER REFERENCES political_parties(id),
  ADD CONSTRAINT fk_party FOREIGN KEY (party_id) REFERENCES political_parties(id);

-- Keep old party VARCHAR column for migration
-- After migration complete, can optionally drop old column
```

---

## Implementation Priority

### Phase 1: Foundation (Critical)
1. ✅ Create `political_parties` table
2. ✅ Seed table with Irish political parties
3. ✅ Create `PartyBadge` component
4. ✅ Update `PoliticiansList` to use PartyBadge

### Phase 2: Management (High)
5. ✅ Create `/admin/parties` management page
6. ✅ Implement party icon upload functionality
7. ✅ Update `/add` form to use party selector dropdown

### Phase 3: Enhancement (Medium)
8. ✅ Add party-specific colors throughout UI
9. ✅ Enhance filtering with icons
10. ✅ Update all promise views to show party badges

### Phase 4: Polish (Low)
11. ✅ Add responsive mobile optimizations
12. ✅ Implement party statistics/analytics
13. ✅ Add party comparison features

---

## Component Architecture

### New Components to Create

```
/components
  /party
    ├── PartyBadge.tsx          - Display party with icon/color
    ├── PartySelector.tsx       - Dropdown for selecting party
    ├── PartyFilter.tsx         - Enhanced filter with icons
    ├── PartyIconUpload.tsx     - Icon upload component
    └── PartyManagementTable.tsx - Admin table for parties

/app
  /admin
    /parties
      ├── page.tsx              - Party management page
      └── [id]
          └── page.tsx          - Edit party details
```

### Shared Types

```typescript
// /types/party.ts
export interface PoliticalParty {
  id: number;
  name: string;
  abbreviation: string;
  color: string;
  textColor: string;
  iconUrl?: string;
  description?: string;
  active: boolean;
  displayOrder: number;
}

export interface PartyBadgeProps {
  party: PoliticalParty | null;
  showIcon?: boolean;
  showFullName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

---

## User Experience Flow

### Adding a New Politician (with party icon)

1. User navigates to `/add`
2. Fills in politician details
3. Clicks "Political Party" dropdown
4. Sees list of parties with icons and colors
5. Selects party → sees preview badge
6. Submits form
7. Politician appears in list with party badge and icon

### Managing Party Icons (Admin)

1. Admin navigates to `/admin/parties`
2. Sees list of all parties
3. Clicks "Edit" on a party
4. Uploads new icon or selects from library
5. Chooses party color with color picker
6. Previews badge appearance
7. Saves changes
8. All politicians with that party immediately show new icon

---

## Accessibility Considerations

- **Color Contrast**: Ensure text color contrasts with party color (WCAG AA: 4.5:1)
- **Alt Text**: Provide meaningful alt text for party icons
- **Keyboard Navigation**: All dropdowns and selectors keyboard accessible
- **Screen Readers**: Announce party name, not just show icon
- **Focus States**: Clear focus indicators on interactive elements

---

## Testing Checklist

### Unit Tests
- [ ] PartyBadge renders correctly with/without icon
- [ ] PartySelector filters parties correctly
- [ ] Color contrast calculation works
- [ ] Icon upload validates file types/sizes

### Integration Tests
- [ ] Party assignment saves to database correctly
- [ ] Party filter updates politician list
- [ ] Icon upload and retrieval works
- [ ] Party data loads in all relevant pages

### Visual Regression Tests
- [ ] Party badges display consistently
- [ ] Icons render at correct sizes
- [ ] Colors match design system
- [ ] Responsive layouts work on mobile

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Color contrast meets WCAG standards
- [ ] Focus states are visible

---

## Design Resources

### Suggested Icon Sources
- **Custom Design**: Commission custom party logos
- **Open Source**: Use open government/public domain icons
- **Icon Libraries**: Heroicons, Font Awesome (for generic fallbacks)

### Color Palette (Irish Political Parties)

| Party | Primary Color | Text Color | Hex |
|-------|--------------|------------|-----|
| Fianna Fáil | Green | White | #66BB6A |
| Fine Gael | Blue | White | #2196F3 |
| Sinn Féin | Dark Green | White | #326634 |
| Labour | Red | White | #E53935 |
| Social Democrats | Purple | White | #8E24AA |
| Green Party | Green | White | #4CAF50 |
| People Before Profit | Orange | White | #FF6F00 |
| Independents | Gray | Dark Gray | #9E9E9E |

---

## Next Steps

1. **Review this document** with stakeholders
2. **Prioritize features** based on business needs
3. **Create design mockups** for key components
4. **Set up database migration** for political_parties table
5. **Start Phase 1 implementation**
6. **Iterate based on user feedback**

---

## Questions to Resolve

1. Should we allow custom party additions by users, or admin-only?
2. What's the preferred icon format (SVG vs PNG)?
3. Where should icons be stored (local vs CDN)?
4. Should we track party affiliation history (politicians changing parties)?
5. Do we need party descriptions/websites linked?
6. Should party colors be enforced or customizable per instance?

---

## Estimated Development Time

- **Phase 1**: 2-3 days
- **Phase 2**: 3-4 days
- **Phase 3**: 2-3 days
- **Phase 4**: 2-3 days

**Total**: ~2-3 weeks for full implementation

---

## References

- Current Politicians List: `/components/PoliticiansList.tsx`
- Add Form: `/app/add/page.tsx`
- Database Schema: `/db/schema.sql`
- Promise Views: `/components/PromisesList.tsx`, `/app/promises/[id]/page.tsx`
