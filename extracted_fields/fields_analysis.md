# PDF Form Analysis: IMP_QRE_270_E&B_CombinedModes.pdf

**Total Fields:** 175
**Sections:** 6

## Sections Overview

### Patient Info (15 fields)
- **Patient ID  DOB**: text
  - X12: `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`
- **Patient ID First Name  Last Name**: text
  - X12: `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`
- **Patient ID First Name Last Name  DOB**: text
  - X12: `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`
- **Patient ID First Name DOB**: text
  - X12: `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`
- **Patient ID Last Name DOB**: text
  - X12: `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`
- **Patient ID  First Name**: text
  - X12: `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`
- **requirements for the formatting of the patient ID on the 270 request**: signature
  - X12: `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`
- **Do test files require valid membership records?**: signature
- **Patient ID_12**: signature
  - X12: `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`
- **Patient last name requirements_13**: unknown
- **Patient first name requirements_13**: unknown
- **Patient rel2subscriber_13**: unknown
- **Do test files require valid membership records**: signature
- **10 Do test files require valid membership records**: signature
- **patient_id**: text
  - X12: `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`

### Provider Info (7 fields)
- **In Availity Essentials providers select payers by first selecting their state in a dropdown list Is your**: signature
  - X12: `REF*EI*{TaxID}`
- **Do test files require valid provider data**: signature
- **Provider Express Entry_12_requirements**: unknown
- **Provider Identifiers NM108 requirements_12**: unknown
- **Provider Identifiers NM109 requirements_12**: unknown
- **Do test files require valid provider data_2**: signature
- **Do test files require valid provider data_3**: signature

### Insurance Info (1 fields)
- **Availitys standard deployment process is to publish your payer IDs in the Availity Health Plan**: signature

### Service Info (2 fields)
- **Can you support all service type codes**: signature
- **Can you support all service types?**: signature

### Authorization (4 fields)
- **Please describe your production approval process**: unknown
- **After you receive production approval will your test environment continue to be available_2**: signature
  - X12: `REF*EI*{TaxID}`
- **Please describe your production approval process_2**: unknown
- **After you receive production approval will your test environment continue to be available_3**: signature
  - X12: `REF*EI*{TaxID}`

### Other (146 fields)
- **Organization name**: unknown
- **Required return date**: unknown
- **Name1**: unknown
- **Phone1**: unknown
  - X12: `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Email1**: unknown
  - X12: `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Name2**: unknown
- **Phone2**: unknown
  - X12: `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Email2**: unknown
  - X12: `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Name3**: unknown
- **Phone3**: unknown
  - X12: `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Email3**: unknown
  - X12: `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Name4**: unknown
- **Phone4**: unknown
  - X12: `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Email4**: unknown
  - X12: `PER*IC*{ContactName}*EM*{EmailAddress}`
- **AVName1**: unknown
- **AVPhone1**: unknown
  - X12: `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **AVEmail1**: unknown
  - X12: `PER*IC*{ContactName}*EM*{EmailAddress}`
- **AVName2**: unknown
- **AVPhone2**: unknown
  - X12: `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **AVEmail2**: unknown
  - X12: `PER*IC*{ContactName}*EM*{EmailAddress}`
- **AVName3**: unknown
- **AVPhone3**: unknown
  - X12: `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **AVEmail3**: unknown
  - X12: `PER*IC*{ContactName}*EM*{EmailAddress}`
- **AVName4**: unknown
- **AVPhone4**: unknown
  - X12: `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **AVEmail4**: unknown
  - X12: `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Do you require Availity to enroll prior to submitting 270 transactions**: signature
  - X12: `REF*EI*{TaxID}`
- **Real-time web**: text
- **Real-time B2B**: text
- **EDI batch**: text
- **ISA06_270**: signature
- **ISA06_270_define value**: unknown
- **ISA06_271**: signature
- **ISA06_271_define value**: unknown
- **ISA07_271**: signature
- **ISA07_271_define value**: unknown
- **ISA08_270**: signature
- **ISA08_270_define value**: unknown
- **ISA16 Component Element Separator_3**: signature
- **GS02_270**: signature
- **GS02_270_define value**: unknown
- **GS02_271**: signature
- **GS02_271_define value**: unknown
- **GS03_270**: signature
- **GS03_270_define value**: unknown
- **GS03_271**: signature
- **GS03_271_define value**: unknown
- **270_2100A_NM103**: unknown
- **271_2100A_NM103**: unknown
- **270_2100A_NM109**: unknown
- **271_2100A_NM109**: unknown
- **Availitys standard is to send uppercase characters Is this acceptable**: signature
- **A space is part of the X12 basic character set Does your system accept spaces**: signature
- **Do you accept characters from the X12 extended character set**: signature
- **How do you reject the transaction?**: signature
- **If your ANSI translator detects a syntax error within the ANSI X12 transmission file, how will you reject the transaction?  Other. Please explain:**: unknown
- **Do you support the TA1 response?**: signature
- **Is the TA1 response driven by ISA14?**: signature
- **Will you reject transactions that contain not used segments**: signature
- **Will you return additional data not reported in the standard 271 response**: signature
- **Payer_ID_8**: unknown
- **Is this a controlled deployment?**: signature
- **Payer_Name_8**: unknown
- **Specify the states.0.0**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.1.0**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.2.0**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.3.0**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.4.0**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.0.1**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.1.1**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.2.1**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.3.1**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.4.1**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.0.2**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.1.2**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.2.2**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.3.2**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Specify the states.4.2**: unknown
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Availity supports XML envelope structure Do you require an XML wrapper**: signature
- **Do you have differing connectivity requirements for each state?**: signature
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Test URL**: unknown
- **Test user IDs**: unknown
- **Prod URL**: unknown
- **Prod user IDs**: unknown
- **What are your system's hours of availability?**: unknown
- **How many continuous threads can you support?**: unknown
  - X12: `REF*EI*{TaxID}`
- **Will your test environment remain available?**: signature
- **Does your organization have specific testing requirements**: signature
  - X12: `REF*EI*{TaxID}`
- **Does your organization have specific testing requirements? If Yes, please specify:**: unknown
  - X12: `REF*EI*{TaxID}`
- **Do you exclude any E&B benefit types from testing?**: signature
  - X12: `REF*EI*{TaxID}`
- **4.Do you exclude any E&B benefit types from testing?**: unknown
  - X12: `REF*EI*{TaxID}`
- **Do you have a designated payer ID you would like Availity to use in testing**: signature
  - X12: `REF*EI*{TaxID}`
- **If Yes, please specify (please include a separate attachment if you require different IDs for different lines of business):**: unknown
- **Do you have a minimum or maximum number of test transactions you will accept**: signature
- **Do you have a minimum or maximum number of test transactions you will accept?**: unknown
- **Do you have any other testing or test transaction restrictions**: signature
  - X12: `REF*EI*{TaxID}`
- **Do you have any other testing or test transaction restrictions?**: unknown
  - X12: `REF*EI*{TaxID}`
- **When will you be prepared to receive a test file?**: unknown
- **Payer name_11**: unknown
- **Payer ID qualifier_11**: signature
- **Payer ID qualifier_11_define**: unknown
- **Payer ID_11**: signature
- **Payer ID_11_define**: unknown
- **Date of birth requirements_13**: unknown
  - X12: `DMG*D8*{DateOfBirth}`
- **Gender code requirements_13**: unknown
- **As of date requirements_14**: unknown
- **2. Availity supports XML envelope structure Do you require an XML wrapper**: signature
- **Do you have differing connectivity requirements for each state?2**: signature
  - X12: `N4*{City}*{State}*{ZipCode}`
- **Test URL2**: unknown
- **Test user IDs2**: unknown
- **Prod URL2**: unknown
- **Prod user IDs2**: unknown
- **What are your system's hours of availability?2**: unknown
- **How many continuous threads can you support?2**: unknown
  - X12: `REF*EI*{TaxID}`
- **Does your organization have specific testing requirements_2**: signature
  - X12: `REF*EI*{TaxID}`
- **Does your organization have specific testing requirements? If Yes please specify**: unknown
  - X12: `REF*EI*{TaxID}`
- **Do you exclude any EB benefit types from testing**: signature
  - X12: `REF*EI*{TaxID}`
- **Do you exclude any E&B benefit types from testing? If Yes please specify**: unknown
  - X12: `REF*EI*{TaxID}`
- **Do you have a designated payer ID you would like Availity to use in testing_2**: signature
  - X12: `REF*EI*{TaxID}`
- **different lines of business**: unknown
- **Do you have a minimum or maximum number of test transactions you will accept_2**: signature
- **Do you have a minimum or maximum number of test transactions you will accept? If Yes please specify**: unknown
- **Do you have any other testing or test transaction restrictions_2**: signature
  - X12: `REF*EI*{TaxID}`
- **Do you have any other testing or test transaction restrictions? If Yes please specify**: unknown
  - X12: `REF*EI*{TaxID}`
- **10 When will you be prepared to receive a test file Please specify a date or date range**: unknown
- **Please define your naming convention for inbound files**: unknown
- **Does your organization have a separate test environment for EDI transactions**: signature
- **Does your organization have a separate test environment for EDI transactions? If Yes please describe**: unknown
- **If you answered Yes to 2 which reports will be returned in the endtoend test process**: signature
- **If you answered Yes to #2, which reports will be returned in the end-to-end test process?**: unknown
- **Does your organization have specific testing requirements_3**: signature
  - X12: `REF*EI*{TaxID}`
- **Does your organization have specific testing requirements? If Yes please specify_5**: unknown
  - X12: `REF*EI*{TaxID}`
- **How many test files will you accept during testing?**: unknown
  - X12: `REF*EI*{TaxID}`
- **Do you exclude any types of EB benefits from testing**: signature
  - X12: `REF*EI*{TaxID}`
- **Do you exclude any types of E&B benefits from testing? If Yes please specify**: unknown
  - X12: `REF*EI*{TaxID}`
- **11 Do you have a designated Payer ID that you would like Availity to use in testing**: signature
  - X12: `REF*EI*{TaxID}`
- **Do you have a designated Payer ID that you would like Availity to use in testing? If Yes, please specify (please include a separate attachment if you require different IDs for different lines of business):**: unknown
  - X12: `REF*EI*{TaxID}`
- **12 When will you be prepared to receive a test file Please specify a date or date range**: unknown
- **real**: text
- **edi_batch_please_only_complete_this_questionnaire**: text
- **030240928**: text
- **or_define_value**: text
- **availity_defines**: text
- **01**: text
- **yes**: text
- **no_if_no**: text

## Detailed Field Information

### 01
- **Type:** text
- **Section:** other
- **Required:** No
- **Label:** 01

### 030240928
- **Type:** text
- **Section:** other
- **Required:** No
- **Label:** 030240928

### 10 Do test files require valid membership records
- **Type:** signature
- **Section:** patient_info
- **Required:** No

### 10 When will you be prepared to receive a test file Please specify a date or date range
- **Type:** unknown
- **Section:** other
- **Required:** No
- **Validation:** date_format

### 11 Do you have a designated Payer ID that you would like Availity to use in testing
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### 12 When will you be prepared to receive a test file Please specify a date or date range
- **Type:** unknown
- **Section:** other
- **Required:** No
- **Validation:** date_format

### 2. Availity supports XML envelope structure Do you require an XML wrapper
- **Type:** signature
- **Section:** other
- **Required:** No

### 270_2100A_NM103
- **Type:** unknown
- **Section:** other
- **Required:** No

### 270_2100A_NM109
- **Type:** unknown
- **Section:** other
- **Required:** No

### 271_2100A_NM103
- **Type:** unknown
- **Section:** other
- **Required:** No

### 271_2100A_NM109
- **Type:** unknown
- **Section:** other
- **Required:** No

### 4.Do you exclude any E&B benefit types from testing?
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### A space is part of the X12 basic character set Does your system accept spaces
- **Type:** signature
- **Section:** other
- **Required:** No

### AVEmail1
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Validation:** email_format

### AVEmail2
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Validation:** email_format

### AVEmail3
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Validation:** email_format

### AVEmail4
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Validation:** email_format

### AVName1
- **Type:** unknown
- **Section:** other
- **Required:** No

### AVName2
- **Type:** unknown
- **Section:** other
- **Required:** No

### AVName3
- **Type:** unknown
- **Section:** other
- **Required:** No

### AVName4
- **Type:** unknown
- **Section:** other
- **Required:** No

### AVPhone1
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Validation:** phone_format

### AVPhone2
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Validation:** phone_format

### AVPhone3
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Validation:** phone_format

### AVPhone4
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Validation:** phone_format

### After you receive production approval will your test environment continue to be available_2
- **Type:** signature
- **Section:** authorization
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### After you receive production approval will your test environment continue to be available_3
- **Type:** signature
- **Section:** authorization
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### As of date requirements_14
- **Type:** unknown
- **Section:** other
- **Required:** No
- **Validation:** date_format

### Availity supports XML envelope structure Do you require an XML wrapper
- **Type:** signature
- **Section:** other
- **Required:** No

### Availitys standard deployment process is to publish your payer IDs in the Availity Health Plan
- **Type:** signature
- **Section:** insurance_info
- **Required:** No

### Availitys standard is to send uppercase characters Is this acceptable
- **Type:** signature
- **Section:** other
- **Required:** No

### Can you support all service type codes
- **Type:** signature
- **Section:** service_info
- **Required:** No

### Can you support all service types?
- **Type:** signature
- **Section:** service_info
- **Required:** No

### Date of birth requirements_13
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `DMG*D8*{DateOfBirth}`
- **Validation:** date_format

### Do test files require valid membership records
- **Type:** signature
- **Section:** patient_info
- **Required:** No

### Do test files require valid membership records?
- **Type:** signature
- **Section:** patient_info
- **Required:** No

### Do test files require valid provider data
- **Type:** signature
- **Section:** provider_info
- **Required:** No

### Do test files require valid provider data_2
- **Type:** signature
- **Section:** provider_info
- **Required:** No

### Do test files require valid provider data_3
- **Type:** signature
- **Section:** provider_info
- **Required:** No

### Do you accept characters from the X12 extended character set
- **Type:** signature
- **Section:** other
- **Required:** No

### Do you exclude any E&B benefit types from testing?
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you exclude any E&B benefit types from testing? If Yes please specify
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you exclude any EB benefit types from testing
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you exclude any types of E&B benefits from testing? If Yes please specify
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you exclude any types of EB benefits from testing
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you have a designated Payer ID that you would like Availity to use in testing? If Yes, please specify (please include a separate attachment if you require different IDs for different lines of business):
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you have a designated payer ID you would like Availity to use in testing
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you have a designated payer ID you would like Availity to use in testing_2
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you have a minimum or maximum number of test transactions you will accept
- **Type:** signature
- **Section:** other
- **Required:** No

### Do you have a minimum or maximum number of test transactions you will accept?
- **Type:** unknown
- **Section:** other
- **Required:** No

### Do you have a minimum or maximum number of test transactions you will accept? If Yes please specify
- **Type:** unknown
- **Section:** other
- **Required:** No

### Do you have a minimum or maximum number of test transactions you will accept_2
- **Type:** signature
- **Section:** other
- **Required:** No

### Do you have any other testing or test transaction restrictions
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you have any other testing or test transaction restrictions?
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you have any other testing or test transaction restrictions? If Yes please specify
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you have any other testing or test transaction restrictions_2
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you have differing connectivity requirements for each state?
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Do you have differing connectivity requirements for each state?2
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Do you require Availity to enroll prior to submitting 270 transactions
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Do you support the TA1 response?
- **Type:** signature
- **Section:** other
- **Required:** No

### Does your organization have a separate test environment for EDI transactions
- **Type:** signature
- **Section:** other
- **Required:** No

### Does your organization have a separate test environment for EDI transactions? If Yes please describe
- **Type:** unknown
- **Section:** other
- **Required:** No

### Does your organization have specific testing requirements
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Does your organization have specific testing requirements? If Yes please specify
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Does your organization have specific testing requirements? If Yes please specify_5
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Does your organization have specific testing requirements? If Yes, please specify:
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Does your organization have specific testing requirements_2
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Does your organization have specific testing requirements_3
- **Type:** signature
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### EDI batch
- **Type:** text
- **Section:** other
- **Required:** No

### Email1
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **X12 Mapping:** `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Validation:** required, email_format

### Email2
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **X12 Mapping:** `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Validation:** required, email_format

### Email3
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **X12 Mapping:** `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Validation:** required, email_format

### Email4
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **X12 Mapping:** `PER*IC*{ContactName}*EM*{EmailAddress}`
- **Validation:** required, email_format

### GS02_270
- **Type:** signature
- **Section:** other
- **Required:** No

### GS02_270_define value
- **Type:** unknown
- **Section:** other
- **Required:** No

### GS02_271
- **Type:** signature
- **Section:** other
- **Required:** No

### GS02_271_define value
- **Type:** unknown
- **Section:** other
- **Required:** No

### GS03_270
- **Type:** signature
- **Section:** other
- **Required:** No

### GS03_270_define value
- **Type:** unknown
- **Section:** other
- **Required:** No

### GS03_271
- **Type:** signature
- **Section:** other
- **Required:** No

### GS03_271_define value
- **Type:** unknown
- **Section:** other
- **Required:** No

### Gender code requirements_13
- **Type:** unknown
- **Section:** other
- **Required:** No

### How do you reject the transaction?
- **Type:** signature
- **Section:** other
- **Required:** No

### How many continuous threads can you support?
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### How many continuous threads can you support?2
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### How many test files will you accept during testing?
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### ISA06_270
- **Type:** signature
- **Section:** other
- **Required:** No

### ISA06_270_define value
- **Type:** unknown
- **Section:** other
- **Required:** No

### ISA06_271
- **Type:** signature
- **Section:** other
- **Required:** No

### ISA06_271_define value
- **Type:** unknown
- **Section:** other
- **Required:** No

### ISA07_271
- **Type:** signature
- **Section:** other
- **Required:** No

### ISA07_271_define value
- **Type:** unknown
- **Section:** other
- **Required:** No

### ISA08_270
- **Type:** signature
- **Section:** other
- **Required:** No

### ISA08_270_define value
- **Type:** unknown
- **Section:** other
- **Required:** No

### ISA16 Component Element Separator_3
- **Type:** signature
- **Section:** other
- **Required:** No

### If Yes, please specify (please include a separate attachment if you require different IDs for different lines of business):
- **Type:** unknown
- **Section:** other
- **Required:** No

### If you answered Yes to #2, which reports will be returned in the end-to-end test process?
- **Type:** unknown
- **Section:** other
- **Required:** No

### If you answered Yes to 2 which reports will be returned in the endtoend test process
- **Type:** signature
- **Section:** other
- **Required:** No

### If your ANSI translator detects a syntax error within the ANSI X12 transmission file, how will you reject the transaction?  Other. Please explain:
- **Type:** unknown
- **Section:** other
- **Required:** No

### In Availity Essentials providers select payers by first selecting their state in a dropdown list Is your
- **Type:** signature
- **Section:** provider_info
- **Required:** No
- **X12 Mapping:** `REF*EI*{TaxID}`

### Is the TA1 response driven by ISA14?
- **Type:** signature
- **Section:** other
- **Required:** No

### Is this a controlled deployment?
- **Type:** signature
- **Section:** other
- **Required:** No

### Name1
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **Validation:** required

### Name2
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **Validation:** required

### Name3
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **Validation:** required

### Name4
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **Validation:** required

### Organization name
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **Validation:** required

### Patient ID  DOB
- **Type:** text
- **Section:** patient_info
- **Required:** No
- **X12 Mapping:** `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`

### Patient ID  First Name
- **Type:** text
- **Section:** patient_info
- **Required:** No
- **X12 Mapping:** `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`

### Patient ID First Name  Last Name
- **Type:** text
- **Section:** patient_info
- **Required:** No
- **X12 Mapping:** `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`

### Patient ID First Name DOB
- **Type:** text
- **Section:** patient_info
- **Required:** No
- **X12 Mapping:** `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`

### Patient ID First Name Last Name  DOB
- **Type:** text
- **Section:** patient_info
- **Required:** No
- **X12 Mapping:** `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`

### Patient ID Last Name DOB
- **Type:** text
- **Section:** patient_info
- **Required:** No
- **X12 Mapping:** `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`

### Patient ID_12
- **Type:** signature
- **Section:** patient_info
- **Required:** No
- **X12 Mapping:** `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`

### Patient first name requirements_13
- **Type:** unknown
- **Section:** patient_info
- **Required:** No

### Patient last name requirements_13
- **Type:** unknown
- **Section:** patient_info
- **Required:** No

### Patient rel2subscriber_13
- **Type:** unknown
- **Section:** patient_info
- **Required:** No

### Payer ID qualifier_11
- **Type:** signature
- **Section:** other
- **Required:** No

### Payer ID qualifier_11_define
- **Type:** unknown
- **Section:** other
- **Required:** No

### Payer ID_11
- **Type:** signature
- **Section:** other
- **Required:** No

### Payer ID_11_define
- **Type:** unknown
- **Section:** other
- **Required:** No

### Payer name_11
- **Type:** unknown
- **Section:** other
- **Required:** No

### Payer_ID_8
- **Type:** unknown
- **Section:** other
- **Required:** No

### Payer_Name_8
- **Type:** unknown
- **Section:** other
- **Required:** No

### Phone1
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **X12 Mapping:** `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Validation:** required, phone_format

### Phone2
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **X12 Mapping:** `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Validation:** required, phone_format

### Phone3
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **X12 Mapping:** `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Validation:** required, phone_format

### Phone4
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **X12 Mapping:** `PER*IC*{ContactName}*TE*{PhoneNumber}`
- **Validation:** required, phone_format

### Please define your naming convention for inbound files
- **Type:** unknown
- **Section:** other
- **Required:** No

### Please describe your production approval process
- **Type:** unknown
- **Section:** authorization
- **Required:** No

### Please describe your production approval process_2
- **Type:** unknown
- **Section:** authorization
- **Required:** No

### Prod URL
- **Type:** unknown
- **Section:** other
- **Required:** No

### Prod URL2
- **Type:** unknown
- **Section:** other
- **Required:** No

### Prod user IDs
- **Type:** unknown
- **Section:** other
- **Required:** No

### Prod user IDs2
- **Type:** unknown
- **Section:** other
- **Required:** No

### Provider Express Entry_12_requirements
- **Type:** unknown
- **Section:** provider_info
- **Required:** No

### Provider Identifiers NM108 requirements_12
- **Type:** unknown
- **Section:** provider_info
- **Required:** No

### Provider Identifiers NM109 requirements_12
- **Type:** unknown
- **Section:** provider_info
- **Required:** No

### Real-time B2B
- **Type:** text
- **Section:** other
- **Required:** No

### Real-time web
- **Type:** text
- **Section:** other
- **Required:** No

### Required return date
- **Type:** unknown
- **Section:** other
- **Required:** Yes
- **Validation:** required, date_format

### Specify the states.0.0
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.0.1
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.0.2
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.1.0
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.1.1
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.1.2
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.2.0
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.2.1
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.2.2
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.3.0
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.3.1
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.3.2
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.4.0
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.4.1
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Specify the states.4.2
- **Type:** unknown
- **Section:** other
- **Required:** No
- **X12 Mapping:** `N4*{City}*{State}*{ZipCode}`

### Test URL
- **Type:** unknown
- **Section:** other
- **Required:** No

### Test URL2
- **Type:** unknown
- **Section:** other
- **Required:** No

### Test user IDs
- **Type:** unknown
- **Section:** other
- **Required:** No

### Test user IDs2
- **Type:** unknown
- **Section:** other
- **Required:** No

### What are your system's hours of availability?
- **Type:** unknown
- **Section:** other
- **Required:** No

### What are your system's hours of availability?2
- **Type:** unknown
- **Section:** other
- **Required:** No

### When will you be prepared to receive a test file?
- **Type:** unknown
- **Section:** other
- **Required:** No

### Will you reject transactions that contain not used segments
- **Type:** signature
- **Section:** other
- **Required:** No

### Will you return additional data not reported in the standard 271 response
- **Type:** signature
- **Section:** other
- **Required:** No

### Will your test environment remain available?
- **Type:** signature
- **Section:** other
- **Required:** No

### availity_defines
- **Type:** text
- **Section:** other
- **Required:** No
- **Label:** Availity defines

### different lines of business
- **Type:** unknown
- **Section:** other
- **Required:** No

### edi_batch_please_only_complete_this_questionnaire
- **Type:** text
- **Section:** other
- **Required:** No
- **Label:** EDI batch
Please only complete this questionnaire

### no_if_no
- **Type:** text
- **Section:** other
- **Required:** No
- **Label:** No 
If No

### or_define_value
- **Type:** text
- **Section:** other
- **Required:** No
- **Label:** or define
value

### patient_id
- **Type:** text
- **Section:** patient_info
- **Required:** No
- **Label:** Patient ID
- **X12 Mapping:** `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`

### real
- **Type:** text
- **Section:** other
- **Required:** No
- **Label:** Real

### requirements for the formatting of the patient ID on the 270 request
- **Type:** signature
- **Section:** patient_info
- **Required:** No
- **X12 Mapping:** `NM1*IL*1*{LastName}*{FirstName}***MI*{MemberID}`

### yes
- **Type:** text
- **Section:** other
- **Required:** No
- **Label:** Yes