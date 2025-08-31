# APOC - Availity POC Digital Questionnaire

Hi Team, the prospect has shared a initial high-level requirements for the internal concept to move to a digital intake questionnaire. sharing it here to help as reference for the POC we are building

Digital Survey Requirements

 
Objective: New customer onboarding wizard integrated with scope of contract, limited to standard X12 HIPAA transactions (e.g. E&B, CS, Claims, ERA). Wizard will walk through implementation questionnaire in Turbo Tax style question/answer flow. 

Requirements:

1) Questionnaire link to technical documentation relevant to individual product component.
2) Shared access to assign pages to additional customer team members to the questionnaire for parallel  completion
3) Simplify questions to reduce duplication and remove open ended questions.
4) Decision tree model to only present questions applicable based on product, mode, etc.
5) Scalable design for additional transactions, for example. Content that can be applied to all transactions can be collected and auto populated such as Payer Name, PID, Logos, etc.
6) Always the latest version of the questionnaire.
7) Saves each page as you go
😎 Field level validation. Ex. Date fields in date format, email addresses, required fields, etc.
9) Must track changes with last modified by x on x date.
10)Customer view must have all questionnaires contracted with what is active, in progress, archived by who and when.
11)Email customer and Availity with submitted transaction questionnaire. Customer PDF, however Availity may also need CSV or JSON, something that could be imported to our configuration in the long term.
12)Availity users ability to :
-Visibility to which product components a customer has.
-Monitor process to ensure that nothing is stuck in a step for excessive time. Progress queue.
-Abandonment monitoring for success measuring.
 

Nice to have:

- Incorporate AI support tool where possible to answer basic questions within Availity Help topics and Technical documents.

- Ability to copy an implementation and apply to a new Payer Name, PID, Logo if the customer wants the same set up in another region.