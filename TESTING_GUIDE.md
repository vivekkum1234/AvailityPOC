# Testing Guide - 50 Test Case Recommendation System

## Prerequisites
- Backend running on `http://localhost:3002`
- Frontend running on `http://localhost:3000`
- OpenAI API key configured in `.env`
- At least one payer implementation submitted in the system

## Test Scenarios

### Test 1: Generate 50 Test Recommendations (Real-time B2B)

**Steps:**
1. Navigate to `http://localhost:3000`
2. Go to "Payer Testing" section
3. Select a payer with "Real-time B2B" implementation mode
4. Click "Generate Test Recommendations"

**Expected Results:**
- ⏱️ **Timing**: Should complete in ~10-12 seconds
- 📊 **Count**: Should generate 50 test cases total
  - 6 predefined cases (TC_001 to TC_006)
  - 44 AI-generated cases (TC_007 to TC_050)
- ✅ **Success Message**: "Generated 50 test cases: 6 ready-to-use, 44 implementation-specific"

**Verify:**
- [ ] TC_001-006 have "✅ Ready to use" badge (green)
- [ ] TC_007-050 have "⚙️ Requires data configuration" badge (blue)
- [ ] Priority distribution:
  - [ ] ~20 Critical (red badge)
  - [ ] ~15 High (orange badge)
  - [ ] ~15 Medium (blue badge)
- [ ] AI-generated tests are implementation-specific (not generic "Test Service Type XX")
- [ ] Real-time B2B specific tests include:
  - [ ] Threading/concurrency tests
  - [ ] Timeout handling tests
  - [ ] XML wrapper tests (if configured)
  - [ ] System hours tests

### Test 2: Generate 50 Test Recommendations (Real-time Web)

**Steps:**
1. Select a payer with "Real-time Web" implementation mode
2. Click "Generate Test Recommendations"

**Expected Results:**
- Same timing and count as Test 1
- Real-time Web specific tests include:
  - [ ] Web portal authentication tests
  - [ ] Session management tests
  - [ ] Browser compatibility tests
  - [ ] UI response time tests

### Test 3: Generate 50 Test Recommendations (EDI Batch)

**Steps:**
1. Select a payer with "EDI Batch" implementation mode
2. Click "Generate Test Recommendations"

**Expected Results:**
- Same timing and count as Test 1
- EDI Batch specific tests include:
  - [ ] File naming convention tests
  - [ ] Batch file structure tests
  - [ ] Aggregation schedule tests
  - [ ] File transmission protocol tests

### Test 4: Verify Predefined Test Cases Have Data

**Steps:**
1. Generate test recommendations (any implementation mode)
2. Select ONLY the 6 predefined cases (TC_001 to TC_006)
3. Click "Generate Test Data"

**Expected Results:**
- ⏱️ **Timing**: Should be very fast (~2-3 seconds)
- ✅ **All 6 cases should have complete test data**:
  - [ ] TC_001: Active member with general health benefits
  - [ ] TC_002: Inactive member with terminated coverage
  - [ ] TC_003: Member not found error handling
  - [ ] TC_004: Pharmacy (Service Type 88) coverage
  - [ ] TC_005: Invalid member ID format validation
  - [ ] TC_006: Family vs individual coverage level

### Test 5: Verify AI-Generated Cases Require Data Configuration

**Steps:**
1. Generate test recommendations
2. Select some AI-generated cases (TC_007 to TC_050)
3. Click "Generate Test Data"

**Expected Results:**
- ⏱️ **Timing**: May take longer (~10-20 seconds depending on count)
- ✅ **Test data should be generated based on AI**
- Verify test data is specific to the test case description

### Test 6: Error Handling - AI Failure

**Steps:**
1. Temporarily disable OpenAI API key (comment out in `.env`)
2. Restart backend
3. Try to generate test recommendations

**Expected Results:**
- ⚠️ **Fallback behavior**: Should return only 6 predefined cases
- ✅ **Error message**: "Could not generate implementation-specific test cases"
- [ ] User can still use the 6 predefined cases
- [ ] User can retry after fixing API key

### Test 7: Verify Implementation-Specific Tests

**Steps:**
1. Create a payer with specific configuration:
   - Search Options: "Patient ID + DOB", "Patient ID + Name + DOB"
   - Service Types: "30", "88", "35"
   - Member ID Format: "Alphanumeric, 9-12 characters"
   - XML Wrapper: Required
   - Max Threads: 20
2. Generate test recommendations

**Expected Results:**
- [ ] Tests specifically mention "Patient ID + DOB search option"
- [ ] Tests specifically mention "Patient ID + Name + DOB search option"
- [ ] Tests for Service Types 30, 88, and 35
- [ ] Tests for member ID format "Alphanumeric, 9-12 characters"
- [ ] Tests for XML wrapper validation
- [ ] Tests for concurrent requests up to 20 threads

### Test 8: Performance Monitoring

**Steps:**
1. Open browser console (F12)
2. Generate test recommendations
3. Monitor console logs

**Expected Results:**
```
🎯 Generating 50 test recommendations...
✅ Generated 6 predefined test cases (instant)
🚀 Launching 5 parallel AI batch requests...
📤 Batch 1: Generating 9 test cases...
📤 Batch 2: Generating 9 test cases...
📤 Batch 3: Generating 5 test cases...
📤 Batch 4: Generating 9 test cases...
📤 Batch 5: Generating 12 test cases...
✅ Batch 1: Parsed 9 test cases
✅ Batch 2: Parsed 9 test cases
✅ Batch 3: Parsed 5 test cases
✅ Batch 4: Parsed 9 test cases
✅ Batch 5: Parsed 12 test cases
✅ Generated 44 AI test cases in ~10000ms
✅ Total: 50 test recommendations
```

## Success Criteria

### Performance ✅
- [ ] 50 test cases generated in 10-12 seconds (vs 158s baseline)
- [ ] 6 predefined cases appear instantly
- [ ] 5 parallel AI batches execute simultaneously

### Quality ✅
- [ ] AI-generated cases are implementation-specific (not generic)
- [ ] Tests reference actual questionnaire responses
- [ ] Tests are relevant to the implementation mode

### Usability ✅
- [ ] Clear badges showing data availability
- [ ] Color-coded priority badges
- [ ] Success message shows breakdown
- [ ] Graceful error handling

### Reliability ✅
- [ ] Fallback to 6 predefined cases if AI fails
- [ ] No breaking changes to existing functionality
- [ ] Backward compatible with old response format

## Troubleshooting

### Issue: "OpenAI API key not configured"
**Solution**: Check `.env` file has `OPENAI_API_KEY=sk-...`

### Issue: "Generation takes longer than 12 seconds"
**Possible causes**:
- Slow internet connection
- OpenAI API rate limiting
- Large questionnaire responses

### Issue: "AI-generated tests are too generic"
**Solution**: Check that full questionnaire responses are being passed to AI

### Issue: "Only 6 test cases generated"
**Cause**: AI generation failed
**Solution**: Check OpenAI API key and logs for errors

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ✅ Monitor performance in production
3. ✅ Collect user feedback on test quality
4. ✅ Iterate on AI prompts if needed
5. ✅ Consider adding more predefined test cases (TC_007-012)

