# Free Cite Tool - Product Requirements Document

Free Cite Tool is a comprehensive citation management platform that automatically extracts metadata from articles and websites, provides intelligent article suggestions, and generates properly formatted citations across multiple academic styles.

**Experience Qualities:**
1. **Intelligent** - Smart article lookup that anticipates user needs and auto-fills citation data with confidence scoring
2. **Effortless** - Streamlined workflow from article discovery to formatted bibliography with minimal manual input
3. **Professional** - Clean, academic-focused interface that instills confidence in citation accuracy and formatting

**Complexity Level:** Light Application (multiple features with basic state)
This app requires article search, citation formatting, bibliography management, and export functionality, but maintains simplicity through intelligent automation and clear user flows.

## Essential Features

### Smart Article Lookup
- **Functionality**: Search articles by title and auto-suggest matches with confidence scores
- **Purpose**: Eliminate manual data entry and reduce citation errors
- **Trigger**: User types article title in search field
- **Progression**: Type title → View confidence-scored results → Select article → Auto-populate citation fields → Edit if needed → Save to bibliography
- **Success criteria**: 80%+ of academic articles found with high confidence matches, all major metadata fields populated

### Citation Style Conversion
- **Functionality**: Convert saved citations between APA, MLA, Chicago, Harvard styles instantly
- **Purpose**: Support multiple academic requirements without recreating citations
- **Trigger**: User clicks style selector dropdown
- **Progression**: Select citation → Choose new style → View formatted result → Copy or export
- **Success criteria**: All major citation styles supported with proper formatting rules

### Bibliography Management
- **Functionality**: Save, organize, edit, and export collections of citations
- **Purpose**: Build and maintain research bibliographies over time
- **Trigger**: User saves citations or opens bibliography view
- **Progression**: Save citations → Organize in bibliography → Edit details → Export to Word/Google Docs
- **Success criteria**: Persistent storage, easy editing interface, reliable export functionality

### URL Metadata Extraction
- **Functionality**: Extract citation data from website URLs automatically
- **Purpose**: Quickly cite web sources without manual data entry
- **Trigger**: User pastes URL into citation tool
- **Progression**: Paste URL → Auto-extract metadata → Review/edit fields → Save citation
- **Success criteria**: Extract title, author, publication date, site name from 90%+ of academic/news websites

## Edge Case Handling

- **Incomplete metadata**: Show partial results with clear indicators of missing fields and manual edit options
- **Multiple article matches**: Display confidence-scored list with distinguishing details (year, journal, authors)
- **Failed URL extraction**: Graceful fallback to manual entry form with helpful field suggestions
- **Export errors**: Clear error messages with alternative format options and retry mechanisms
- **Empty bibliography**: Engaging empty state with quick-start tutorial and sample citations

## Design Direction

The design should feel scholarly yet modern - professional enough for academic use while remaining approachable for students. Clean, minimalist interface that emphasizes content hierarchy and reduces cognitive load during research workflows.

## Color Selection

Triadic color scheme that balances academic professionalism with digital friendliness and clear information hierarchy.

- **Primary Color**: Deep Academic Blue (oklch(0.35 0.15 250)) - conveys trust, intelligence, and academic authority
- **Secondary Colors**: Warm Sage Green (oklch(0.65 0.08 140)) for success states and confidence indicators; Warm Cream (oklch(0.95 0.02 80)) for subtle backgrounds
- **Accent Color**: Vibrant Coral (oklch(0.68 0.18 25)) for CTAs, important actions, and attention-grabbing elements
- **Foreground/Background Pairings**:
  - Background (White oklch(1 0 0)): Dark Gray text (oklch(0.2 0 0)) - Ratio 16:1 ✓
  - Primary (Deep Blue oklch(0.35 0.15 250)): White text (oklch(1 0 0)) - Ratio 8.2:1 ✓
  - Secondary (Sage Green oklch(0.65 0.08 140)): Dark Gray text (oklch(0.2 0 0)) - Ratio 5.1:1 ✓
  - Accent (Coral oklch(0.68 0.18 25)): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓
  - Muted (Light Gray oklch(0.95 0.01 0)): Medium Gray text (oklch(0.45 0 0)) - Ratio 6.8:1 ✓

## Font Selection

Professional typography that balances academic authority with digital readability, using Inter for its excellent screen legibility and broad character support for international citations.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing  
  - H3 (Citation Titles): Inter Medium/18px/normal spacing
  - Body (Citation Text): Inter Regular/16px/relaxed line height
  - Caption (Metadata): Inter Regular/14px/normal spacing
  - Button Text: Inter Medium/14px/slight letter spacing

## Animations

Subtle, purposeful animations that enhance usability without academic distraction - focusing on state changes, loading feedback, and smooth transitions that guide user attention.

- **Purposeful Meaning**: Smooth transitions communicate system responsiveness and guide users through multi-step citation workflows
- **Hierarchy of Movement**: Search results and confidence indicators deserve animation focus, while static content remains calm and readable

## Component Selection

- **Components**: Card layouts for citations and search results, Dialog for detailed editing, Form components for manual entry, Tabs for citation style switching, Button variants for different action priorities, Badge components for confidence scores, Progress indicators for search states
- **Customizations**: Custom confidence score visualizer component, specialized citation formatter component, export progress indicator
- **States**: Search states (idle, searching, results, error), citation states (draft, saved, exported), confidence levels (high, medium, low) with distinct visual treatments
- **Icon Selection**: Search (MagnifyingGlass), Export (Download), Edit (Pencil), Academic sources (BookOpen), Confidence (CheckCircle, ExclamationCircle)
- **Spacing**: Consistent 4px base unit, generous padding for reading comfort, clear visual separation between citation entries
- **Mobile**: Stack citation details vertically, collapsible advanced options, touch-optimized confidence indicators, simplified export options for mobile workflows