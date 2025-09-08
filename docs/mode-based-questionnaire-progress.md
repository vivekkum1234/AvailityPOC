# Mode-Based Questionnaire Implementation Progress

## Current Status
Working on X12 270/271 questionnaire structure implementation with mode-based conditional logic.

## Completed Tasks
1. ✅ Created basic questionnaire structure with sections
2. ✅ Added Contact Information section with 8 contact types (24 input fields total)
3. ✅ Added Payer Enhancements section with 3 questions
4. ✅ Added Enveloping Requirements section with 10 paired 270/271 options
5. ✅ Added Payer-specific Processing Errors/Edits section
6. ✅ Added Search Options section
7. ✅ Added Response section with notes and conditional logic
8. ✅ Renamed "Implementation Mode Selection" to "Trading Partner Documentation"
9. ✅ Added enrollment requirement question to Trading Partner Documentation
10. ✅ Removed all sections after Response section to prepare for mode-based logic

## Current Work - Mode-Based Decision Tree Implementation

### Standard Sections (Always Visible)
These sections will be shown for ALL implementation modes:
1. Organization Information
2. Trading Partner Documentation (with enrollment + mode selection)
3. Contact Information
4. Payer Enhancements
5. Enveloping Requirements
6. Payer-specific Processing Errors/Edits
7. Search Options
8. Response

### Mode-Specific Sections (Conditional)
Need to add sections that only appear based on selected implementation mode:

**Real-time Web Mode:**
- Additional sections specific to real-time web implementation
- Will use conditionalLogic: { dependsOn: 'implementation-mode-selection', showWhen: ['real_time_web'] }

**Real-time B2B Mode:**
- Additional sections specific to real-time B2B implementation  
- Will use conditionalLogic: { dependsOn: 'implementation-mode-selection', showWhen: ['real_time_b2b'] }

**EDI Batch Mode:**
- Additional sections specific to EDI batch implementation
- Will use conditionalLogic: { dependsOn: 'implementation-mode-selection', showWhen: ['edi_batch'] }

## Implementation Details

### Trading Partner Documentation Section Updates
- **Section ID**: Changed from 'implementation-mode' to 'trading-partner-documentation'
- **Title**: Changed from 'Implementation Mode Selection' to 'Trading Partner Documentation'
- **New Questions Added**:
  1. Enrollment requirement (radio: Yes/No)
  2. Conditional enrollment forms attachment field
  3. Implementation mode selection (radio: real_time_web, real_time_b2b, edi_batch)
  4. Completion instructions (display field)

### Conditional Logic Structure
```typescript
conditionalLogic: {
  dependsOn: 'implementation-mode-selection',
  showWhen: ['mode_value']
}
```

## Next Steps
1. **Identify Mode-Specific Requirements**: Review technical-flow.md and other documentation to determine what sections/questions are needed for each implementation mode
2. **Add Mode-Specific Sections**: Create sections with proper conditional logic for each mode
3. **Test Conditional Logic**: Ensure sections appear/hide correctly based on mode selection
4. **Frontend Implementation**: Update UI to handle conditional section rendering
5. **Validation**: Test questionnaire structure and validation rules

## Files Modified
- `backend/src/data/x12-270-271-complete.ts` - Main questionnaire structure
- `backend/src/types/questionnaire.ts` - Type definitions (reference only)

## Technical Notes
- Using QuestionType.DISPLAY for informational content and notes
- Conditional logic depends on question IDs, not section IDs
- All mode-specific sections should have order numbers > 8 (after Response section)
- Standard sections maintain their current order (1-8)
