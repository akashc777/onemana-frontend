# Web Forms

## Join the Early Access Circle  (route: /early-access, doctype: Early Access Signup)

- introduction: <div class="ql-editor read-mode"><p style="text-align: center;"><span style="color: rgb(100, 116, 139);">Join the </span><span style="color: rgb(37, 99, 235);">Early Access Circle</span><span style="color: rgb(100, 116, 139);"> for our <br></span></p><p style="text-align: center;"><span style="color: rgb(100, 116, 139);"> </span><span style="color: rgb(37, 99, 235);">100% Self-Hosted Unified Workspace.</span><span style="color: rgb(100, 116, 139);"> <br></span></p><p style="text-align: center;"><span style="color: rgb(100, 116, 139);"> You will receive a </span><strong style="color: rgb(100, 116, 139);">unique coupon</strong><span style="color: rgb(100, 116, 139);"> to purchase OneCamp for </span><strong style="color: rgb(100, 116, 139);">$9</strong><span style="color: rgb(100, 116, 139);"> (or ₹849) on launch day: </span><strong style="color: rgb(37, 99, 235);">March 7th, 2026</strong><span style="color: rgb(100, 116, 139);">.</span></p></div>
- success message: Your interest has been recorded. We will reach out shortly with your exclusive early-access credentials.
  - field: Your Name (full_name, Data) reqd=1
  - field: Email Address (email, Data) reqd=1

## Request for Account Deletion  (route: /request-for-account-deletion, doctype: Personal Data Deletion Request)

- introduction: <div class="ql-editor read-mode"><p>Send a request to delete your account and personally identifiable information (PII) that is stored on our system. You will receive an email to verify your request. Once the request is verified we will take care of deleting your PII. If you just want to check what PII we have stored, you can <a href="/request-data" rel="noopener noreferrer">request your data</a>.</p></div>
- success message: An email to verify your request has been sent to your email address. Please verify your request to complete the process.
  - field: Email (email, Data) reqd=1

## Request Data  (route: /request-data, doctype: Personal Data Download Request)

- introduction: <div class="ql-editor read-mode"><p>Request a file containing your personally identifiable information (PII) that is saved on our system. The file will be in JSON format and is sent to you by email. If you would like to have your PII deleted from our system, please make a <a href="/request-to-delete-data" rel="noopener noreferrer">request to delete data</a>.</p></div>
- success message: A download link with your data will be sent to the email address associated with your account.
  - field: Email (user, Data) reqd=1

## Update Profile  (route: /update-profile, doctype: User)

- introduction: 
- success message: Profile updated successfully.
  - field: First Name (first_name, Data) reqd=1
  - field: Middle Name (Optional) (middle_name, Data) reqd=0
  - field: Last Name (last_name, Data) reqd=0
  - field: None (, Column Break) reqd=0
  - field: Profile Picture (user_image, Attach Image) reqd=0
  - field: More Information (None, Section Break) reqd=0
  - field: Phone (phone, Data) reqd=0
  - field: Mobile Number (mobile_no, Data) reqd=0
  - field: None (, Column Break) reqd=0
  - field: Language (language, Link) reqd=0
  - field: Time Zone (time_zone, Select) reqd=0

## Address  (route: /address, doctype: Address)

- introduction: 
- success message: 
  - field: Address Title (address_title, Data) reqd=0
  - field: Address Type (address_type, Select) reqd=1
  - field: Address Line 1 (address_line1, Data) reqd=1
  - field: Address Line 2 (address_line2, Data) reqd=0
  - field: Postal Code (pincode, Data) reqd=0
  - field: City/Town (city, Data) reqd=1
  - field: State/Province (state, Data) reqd=0
  - field: Country (country, Link) reqd=1
  - field: None (None, Column Break) reqd=0
  - field: Email Address (email_id, Data) reqd=0
  - field: Phone (phone, Data) reqd=1
  - field: Preferred Billing Address (is_primary_address, Check) reqd=0
  - field: Preferred Shipping Address (is_shipping_address, Check) reqd=0

## Issue  (route: /issues, doctype: Issue)

- introduction: 
- success message: 
  - field: Subject (subject, Data) reqd=1
  - field: Status (status, Select) reqd=0
  - field: Customer (customer, Data) reqd=0
  - field: Description (description, Text Editor) reqd=0
  - field: Attachment (attachment, Attach) reqd=0
  - field: Priority (priority, Link) reqd=1
  - field: Via Customer Portal (via_customer_portal, Check) reqd=0

## Task  (route: /tasks, doctype: Task)

- introduction: 
- success message: 
  - field: Project (project, Link) reqd=1
  - field: Subject (subject, Data) reqd=1
  - field: Status (status, Select) reqd=0
  - field: Details (description, Text Editor) reqd=0
  - field: Priority (priority, Select) reqd=0
  - field: Expected Start Date (exp_start_date, Date) reqd=0
  - field: Expected End Date (exp_end_date, Date) reqd=0

