TC_004(Pharmacy/Service Type 88):

EB must use EB01=1 (Active Coverage).
Service type must be 88 (Pharmacy).
Coverage level must be IND.
Effective date (DTP*356) must be ≤ request date.
No termination date (DTP*357) if still active.
MSG must confirm pharmacy coverage.

TC_005(Invalid ID Format):

If member ID format is invalid, no EB coverage should be returned.
AAA segment required:
AAA01=Y (reject loop).
AAA02=15 (Response not found).
AAA03=72 (Invalid/Missing ID).
AAA04=N (no further action).
MSG should state clearly: invalid member ID format.
TRN must echo request.

TC_006(Family Coverage):

EB must reflect coverage level:
IND = individual coverage.
FAM = family coverage.
Service Type = 30.
Effective date (DTP*356) must be ≤ service date.
If family coverage, MSG should indicate “Family Coverage”.
No AAA errors if member valid.