# Contact Information Structure

This matches the PDF structure exactly:

## 1. Trading Partner Technical Contact
- **Description**: Technical contact from your organization
- **Required**: Yes
- **Read-only**: No
- **Fields**: Name1, Phone1, Email1

## 2. Availity Technical Contact
- **Description**: Technical contact from Availity (to be completed by Availity)
- **Required**: No
- **Read-only**: Yes
- **Fields**: AVName1, AVPhone1, AVEmail1

## 3. Trading Partner Account/Program Manager
- **Description**: Account or program manager from your organization
- **Required**: No
- **Read-only**: No
- **Fields**: Name2, Phone2, Email2

## 4. Availity Account/Program Manager
- **Description**: Account or program manager from Availity
- **Required**: No
- **Read-only**: Yes
- **Fields**: AVName2, AVPhone2, AVEmail2

## 5. Trading Partner Escalation Contact
- **Description**: Escalation contact from your organization
- **Required**: No
- **Read-only**: No
- **Fields**: Name3, Phone3, Email3

## 6. Availity Escalation Contact
- **Description**: Escalation contact from Availity
- **Required**: No
- **Read-only**: Yes
- **Fields**: AVName3, AVPhone3, AVEmail3

## 7. Additional Trading Partner Contact
- **Description**: Additional contact from your organization
- **Required**: No
- **Read-only**: No
- **Fields**: Name4, Phone4, Email4

## 8. Other Availity Contact
- **Description**: Other contact from Availity
- **Required**: No
- **Read-only**: Yes
- **Fields**: AVName4, AVPhone4, AVEmail4

## Field Mapping

| PDF Field | Questionnaire Field | Type |
|-----------|-------------------|------|
| Name1 | trading-partner-technical-name | Name |
| Phone1 | trading-partner-technical-phone | Phone |
| Email1 | trading-partner-technical-email | Email |
| AVName1 | availity-technical-name | Name |
| AVPhone1 | availity-technical-phone | Phone |
| AVEmail1 | availity-technical-email | Email |
| Name2 | trading-partner-account-manager-name | Name |
| Phone2 | trading-partner-account-manager-phone | Phone |
| Email2 | trading-partner-account-manager-email | Email |
| AVName2 | availity-account-manager-name | Name |
| AVPhone2 | availity-account-manager-phone | Phone |
| AVEmail2 | availity-account-manager-email | Email |
| Name3 | trading-partner-escalation-name | Name |
| Phone3 | trading-partner-escalation-phone | Phone |
| Email3 | trading-partner-escalation-email | Email |
| AVName3 | availity-escalation-name | Name |
| AVPhone3 | availity-escalation-phone | Phone |
| AVEmail3 | availity-escalation-email | Email |
| Name4 | additional-trading-partner-name | Name |
| Phone4 | additional-trading-partner-phone | Phone |
| Email4 | additional-trading-partner-email | Email |
| AVName4 | other-availity-name | Name |
| AVPhone4 | other-availity-phone | Phone |
| AVEmail4 | other-availity-email | Email |
