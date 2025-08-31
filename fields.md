# X12 270/271 Field Requirements

## Column Structure
All field requirements follow this 5-column structure from the Availity questionnaire:

| Field | Field Description | Length | 270 Request | 271 Response |
|-------|------------------|--------|-------------|--------------|

- **Field**: X12 segment and element codes (ISA08, GS02, 2100A NM103, etc.)
- **Field Description**: Human-readable description of what the field contains  
- **Length**: Character length limits for the field
- **270 Request**: Configuration options for eligibility inquiry transactions
- **271 Response**: Configuration options for eligibility response transactions

## Enveloping Requirements

### ISA Envelope Fields

| Field | Field Description | Length | 270 Request | 271 Response |
|-------|------------------|--------|-------------|--------------|
| ISA05 | Sender ID Qualifier | 2 | Values: 01, ZZ<br>☐ 030240928 (Availity defines)<br>☐ or define value | |
| ISA06 | Sender ID | 15 | ☐ 030240928 (Availity defines)<br>☐ or define value | |
| ISA07 | Receiver ID Qualifier | 2 | Values: 01, ZZ<br>☐ 01<br>☐ or define value | |
| ISA08 | Receiver ID | 15 | ☐ Availity defined<br>☐ or define value: 030240928 | |
| ISA11 | Repetition Separator | 1 | ☐ Repetition separator (^)<br>☐ Availity standard | |
| ISA16 | Composite Element Separator | 1 | ☐ Composite separator (:)<br>☐ Availity standard | |

### GS Functional Group Fields

| Field | Field Description | Length | 270 Request | 271 Response |
|-------|------------------|--------|-------------|--------------|
| GS02 | Application Sender Code | 2/15 | ☐ 030240928<br>☐ Availity defines<br>☐ or define value | |
| GS03 | Application Receiver Code | 2/15 | ☐ 030240928<br>☐ or define value | |

### Payer Information Fields

| Field | Field Description | Length | 270 Request | 271 Response |
|-------|------------------|--------|-------------|--------------|
| 2100A NM103 | Payer Name | 1/35 | Define value: **25** | |
| 2100A NM109 | Payer ID | 2/80 | Define value: **11** | |

## Payer Enhancements

### Required Fields

| Field | Field Description | Length | 270 Request | 271 Response |
|-------|------------------|--------|-------------|--------------|

**Question 1: Uppercase Characters**
- **Field**: Availity's standard is to send uppercase characters. Is this acceptable?
- **Options**: ☐ Yes ☐ No

**Question 2: X12 Basic Character Set Spaces**
- **Field**: A space is part of the X12 basic character set. Does your system accept spaces?
- **Options**: ☐ Yes ☐ No

**Question 3: X12 Extended Character Set**
- **Field**: Do you accept characters from the X12 extended character set?
- **Options**: ☐ Yes ☐ No

## Trading Partner Documentation

### Required Fields

| Field | Field Description | Length | 270 Request | 271 Response |
|-------|------------------|--------|-------------|--------------|

**Question 1: Email Notification Requirement**
- **Field**: Do you require Availity to email prior to submitting 270 transactions?
- **Options**: ☐ Yes ☐ No
- **Note**: If Yes, please include the forms Availity needs to complete for enrollment as a separate attachment

**Question 2: Implementation Mode Selection**
- **Field**: Please indicate the mode type you are implementing for the 270/271 transaction:
- **Options**:
  - ☐ Real-time web
  - ☐ Real-time B2B
  - ☐ EDI batch
- **Note**: Please only complete this questionnaire's primary sections (Trading partner documentation through Response) as well as the section for the mode you are implementing

## Payer-Specific Processing Errors/Edits

### Required Fields

| Field | Field Description | Length | 270 Request | 271 Response |
|-------|------------------|--------|-------------|--------------|

**Question 1: ANSI Standard Termination**
- **Field**: If your ANSI standard detects a syntax error within the ANSI X12 transmission file, how will you react the transaction?
- **Options**:
  - ☐ 999 Acknowledgment
  - ☐ Other: Please explain: ___________

**Question 2: TA1 Response Support**
- **Field**: Do you support the TA1 response?
- **Options**: ☐ Yes ☐ No

**Question 3: TA1 Response Driven by ISA14**
- **Field**: Is the TA1 response driven by ISA14 (i.e., if the value in ISA14 = 0, then TA1 is not sent)?
- **Options**: ☐ Yes ☐ No

**Question 4: Reject Transactions with "Not Used" Segments**
- **Field**: Will you reject transactions that contain "not used" segments?
- **Options**: ☐ Yes ☐ No
- **Note**: If you need this additional data as a payer, Availity will need to relax an edit.

## Search Options

### Required Fields

| Field | Field Description | Length | 270 Request | 271 Response |
|-------|------------------|--------|-------------|--------------|

**Question 1: Supported Search Options**
- **Field**: Availity supports all search options listed in the table below. Please indicate which option(s) you support for the 270 request for all transaction modes:
- **Options**:
  - ☐ Patient ID & DOB
  - ☐ Patient ID, First Name, & Last Name
  - ☐ Patient ID, First Name, Last Name, & DOB
  - ☐ Patient ID, First Name, DOB
  - ☐ Patient ID, Last Name, DOB
  - ☐ Patient ID & First Name

**Question 2: Service Type Code Support**
- **Field**: Can you support all service type codes?
- **Options**: ☐ Yes ☐ No
- **Note**: If No, please provide a list of codes you can respond as a separate attachment.
- **Additional Note**: Service type code 30 is the standard to show all benefits. Many health plans use service type 30; however, some may want to restrict benefits to certain specialties.

**Question 3: Patient ID Formatting Requirements**
- **Field**: Some plans have very specific patient ID formatting per line of business (e.g., three alpha characters + seven numeric digits). Would you like Availity to implement specific editing requirements for the formatting of the patient ID on the 270 request?
- **Options**: ☐ Yes ☐ No
- **Note**: If Yes, please include these editing requirements in a separate attachment.

## Response

### Required Fields

| Field | Field Description | Length | 270 Request | 271 Response |
|-------|------------------|--------|-------------|--------------|

**Question 1: Additional Data in 271 Response**
- **Field**: Will you return additional data not reported in the standard 271 response?
- **Options**: ☐ Yes ☐ No
- **Note**: If Yes, please provide examples and specifications of the additional data in a separate attachment.

**Standard Response Behavior**
- **Note**: Availity's standard is to return responses to the Availity customer as they are received from the payer.
- **Additional Note**: All X12 transactions sent to Availity are subjected to SNIP level 4.

---

# Transaction Mode 2: Real-time B2B Implementation

## Connectivity

**Overview**: Healthcare professionals submit patient eligibility inquiry requests to Availity. Availity then routes the valid HIPAA 270 transaction to the assigned receiver. The receiver returns valid HIPAA 271 responses to Availity.

**Technical Note**: Availity supports an HTTPS connection, and the standard timeout is 30 seconds.

### Required Fields

| Field | Field Description | Options | Notes |
|-------|------------------|---------|-------|

**Question 1: XML Envelope Structure**
- **Field**: Do you require an XML wrapper?
- **Options**: ☐ Yes ☐ No
- **If Yes**: Please define your XML envelope requirements in a separate attachment.

**Question 2: Regional Connectivity Requirements**
- **Field**: Do you have differing connectivity requirements and specifications for each region/state?
- **Options**: ☐ Yes ☐ No
- **If Yes**: Please list the requirements in a separate attachment.

**Question 3: Test Environment URLs and Credentials**
- **Field**: Please provide your Test URL and user ID information (password should be submitted separately and kept on file)
- **Sub-fields**:
  - **Test URL(s)**: ________________________________
  - **Test user ID(s)**: ________________________________
- **Note**: If you have different requirements for each region/state, please provide this information for each.

**Question 4: Production Environment URLs and Credentials**
- **Field**: Please provide your Prod URL and user ID information (password should be submitted separately and kept on file)
- **Sub-fields**:
  - **Prod URL(s)**: ________________________________
  - **Prod user ID(s)**: ________________________________
- **Note**: If you have different requirements for each region/state, please provide this information for each.

**Question 5: System Availability**
- **Field**: What are your system's hours of availability?
- **Type**: Free text field

**Question 6: Concurrent Threads**
- **Field**: How many continuous threads can you support?
- **Type**: Free text field