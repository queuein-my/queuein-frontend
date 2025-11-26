# queuein Legal Policies (Alpha Version)

> **Version:** 1.0.0  
> **Last Updated:** November 2025  
> **Effective Date:** November 2025  
> **App URL:** [https://queuein.my](https://queuein.onrender.com)  
> **Status:** Alpha Testing Phase

---

## 🛡️ Introduction

Welcome to **queuein**, a queue management application designed for small businesses such as cafés, clinics, and restaurants.  
queuein is currently in its **alpha testing phase**, meaning it is under active development and may experience bugs, errors, or service interruptions.

By using queuein, you agree to the following **Privacy Policy** and **Terms & Conditions** (“Policies”).  
These documents are intended to protect both you (the user) and us (the developer) while promoting transparency and compliance with the **Malaysian Personal Data Protection Act 2010 (PDPA)**.

If you do not agree with these terms, please stop using the service.

---

# 🧾 Privacy Policy (Alpha Version)

## 1. Introduction

We value your trust and are committed to protecting your personal data.  
This Privacy Policy explains how queuein collects, uses, and protects information in compliance with the PDPA.

queuein is developed and operated by an independent developer based in Malaysia.  
Because this is an **alpha version**, certain features — including automated data export or deletion requests — may still be under development. Please use the service at your own risk.

---

## 2. Information We Collect

Depending on how you use queuein, we may collect:

### a. Business Information

- Business name and email (encrypted)
- Outlet details (name, location, phone number)
- Staff names, roles, and login credentials (passwords are hashed)

### b. Customer Information

- Customer names and phone numbers (encrypted)
- Queue details (e.g., party size, timestamps)
- VIP status (optional flag set by the business for service purposes)

### c. Technical Information

- Browser and device details (for login security)
- Service logs for debugging and performance improvement
- Audit trails for key staff activities

We collect only the minimum data necessary to operate and improve the service.

---

## 3. How We Use Your Information

Data is used for:

- Managing and displaying your business queues
- Allowing you to identify returning customers
- Sending queue-related notifications
- Detecting and preventing misuse of the service
- Improving product functionality and user experience
- **Automated data cleanup to comply with data minimization requirements (PDPA) and optimize system performance**

We **do not sell or trade personal data** to any third parties.

---

## 4. Data Storage and Protection

We apply reasonable technical and organisational safeguards to protect your data:

- Sensitive information (like customer phone numbers) is encrypted in our database.
- HTTPS is enforced for all communications.
- Database access is restricted to authorised systems only.
- Backups are performed regularly and stored securely.

However, as this is an **alpha version**, **we cannot guarantee absolute security or continuous uptime**. By using queuein during this phase, you acknowledge and accept this limitation.

---

## 5. Data Hosting and Cross-Border Transfers

queuein is hosted on **Render.com**, with its servers located in **Singapore**. By using our service, you acknowledge and consent to your data being transferred to and stored in Singapore.

We take reasonable measures to ensure that data stored outside Malaysia receives a standard of protection comparable to that required by the PDPA.

---

## 6. Data Retention

### a. Business and Queue Data

We retain your business and queue data for as long as your account is active. Inactive data may be periodically deleted (after **6 months** of inactivity).

### b. Audit Logs

To optimize database performance and storage, **audit logs are automatically deleted after 30 days**, except for the following critical records which are retained indefinitely:

- Account creation records
- Subscription and payment records
- Staff creation and deletion records

This 30-day retention period is sufficient for security monitoring, debugging, and compliance verification while ensuring the system remains performant.

### c. Customer Contact Information (Non-VIP)

In compliance with data minimization principles under the PDPA, **phone numbers for non-VIP customers are automatically deleted after 24 hours**. This applies to walk-in customers who are not registered in your customer database.

VIP customer records (those you've explicitly saved to your customer list) are retained as long as your account is active.

### d. Account Deletion

You can request the deletion of your account and all associated data by emailing **km_dev@hotmail.com**. Upon account deletion:

- Your business data, outlets, and queue history will be permanently deleted within 30 days.
- Audit logs will be deleted immediately.
- Some anonymized usage statistics may be retained for service improvement purposes.

---

## 6A. Automated Data Processing

queuein uses automated processes (cron jobs) to maintain data hygiene and system performance:

1. **Daily Audit Log Cleanup (2:00 AM MYT)**: Deletes non-critical audit logs older than 30 days
2. **Daily Phone Number Cleanup (2:30 AM MYT)**: Removes non-VIP customer phone numbers older than 24 hours
3. **Monthly Usage Counter Reset (1st of each month, 3:00 AM MYT)**: Resets monthly usage statistics for billing purposes

These automated processes are designed to:

- Comply with PDPA's data minimization and retention limitation principles
- Protect customer privacy by not retaining personal data longer than necessary
- Maintain system performance and reduce storage costs

All automated data deletions are logged in your audit trail (before being subject to the 30-day retention policy themselves).

---

## 7. Your Rights and Roles Under PDPA

### a. Your Rights

As a user, you have the right to:

- Access and correct your business's personal data.
- Withdraw consent for data processing.
- Request the deletion of your account and data.

Withdrawal of consent does not affect data that was lawfully processed prior to the withdrawal. To exercise these rights, please contact **km_dev@hotmail.com**.

### b. Roles and Responsibilities

This section clarifies our respective obligations under the PDPA.

- **Roles**: For the purpose of the PDPA, you are the **Data User** and queuein is your **Data Processor**.
- **Your Responsibilities (as Data User)**: You are solely responsible for the lawfulness of processing your customers' personal data. You warrant that you have obtained valid consent from your customers for their data to be collected, used, and transferred to queuein for the purposes of queue management.
- **Our Responsibilities (as Data Processor)**: We will only process data on your behalf and in accordance with your use of the service. We will implement reasonable security measures to protect the data as outlined in this Privacy Policy.

---

## 8. Data Breach Response

In the event of a security incident:

1. We will investigate and contain the issue promptly.
2. We will notify affected users if their personal data is impacted.
3. We will take corrective steps to prevent a recurrence.

As an alpha-stage product, our breach response is managed manually.

---

## 9. Intellectual Property

All intellectual property in queuein — including its source code, UI, logos, and trademarks — is the exclusive property of **queuein** and its developer.

You retain ownership of your business and customer data. You grant us a limited license to store and process it solely for the purpose of providing the service.

---

## 10. Updates to This Policy

We may update this Privacy Policy to reflect product improvements or regulatory changes. The latest version will always be available within the app or on our website.

---

## 11. Contact Us

**queuein (Development Version)**  
Developer: KM LEONG (Independent Developer, Malaysia)  
Email: km_dev@hotmail.com

---

# ⚖️ Terms and Conditions (Alpha Version)

## 1. Introduction

These Terms govern your use of queuein. By accessing or using the service, you agree to be bound by them.

queuein is provided “**as is**” and “**as available**” during its alpha phase. We are still testing functionality, performance, and security — unexpected behaviour or outages may occur.

---

## 2. Purpose and Scope

queuein is designed to help small businesses manage **first-in-first-out (FIFO)** customer queues. It is **not** intended for emergency services or mission-critical environments.

---

## 3. Alpha Disclaimer

Because queuein is in its alpha phase:

- Data loss, corruption, or service downtime may occur.
- Certain features (such as automated data export) may not be available.
- Security measures are in place but may not yet be enterprise-grade.

By using the service, you accept these risks and agree that queuein and its developer shall **not be held liable** for any resulting losses or damages.

---

## 4. Eligibility

To use queuein, you must:

- Be at least 18 years old.
- Operate a legitimate business or entity.
- Comply with all applicable laws, including the PDPA.

---

## 5. Account Responsibilities

You are responsible for:

- Keeping your login credentials confidential.
- Providing accurate registration details.
- All actions taken by your staff under your account.
- Notifying us immediately of any unauthorised access.

---

## 6. Privacy and Data Use

Your use of queuein is governed by our Privacy Policy (see above). You agree that:

- queuein will process data on your behalf for queue management.
- Your data will be stored on secure cloud servers located in Singapore.
- You are responsible for obtaining all necessary consents from your own customers to allow their data to be processed by queuein in accordance with our Policies.

---

## 7. Acceptable Use

You agree **not to**:

- Use queuein for any unlawful or fraudulent activity.
- Upload malicious code or attempt to breach the system's security.
- Interfere with other users’ access to the service.
- Copy, misuse, or distribute queuein’s software or intellectual property.

Violation of this clause may result in the immediate suspension or termination of your account.

---

## 8. Intellectual Property

All intellectual property in queuein — including its source code, UI, logos, and trademarks — is the exclusive property of **queuein** and its developer.

You retain ownership of your data but grant us a limited license to store and process it for the sole purpose of service delivery.

---

## 9. Feedback

We welcome your feedback during this alpha testing phase. By submitting feedback, you grant us the right to use it to improve queuein without any obligation or compensation to you.

---

## 10. Availability and Updates

queuein may be updated, suspended, or discontinued at any time without notice as part of its ongoing development.

---

## 11. Limitation of Liability

To the fullest extent permitted by Malaysian law:

- queuein and its developer are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
- Our total liability for any claim is limited to **RM100** or the total amount you paid for the service (if any), whichever is less.

You use this **test-phase application** at your own risk.

---

## 12. Indemnity

You agree to indemnify and hold harmless queuein and its developer from any claims, damages, or losses arising from:

- Your misuse of the service.
- Your breach of these Terms.
- Your violation of any laws or third-party rights.

---

## 13. Data Breaches

In the case of a data breach, we will follow the response plan outlined in our Privacy Policy. You acknowledge that our liability for data incidents during the alpha phase is limited as described in these Terms.

---

## 14. Termination

We reserve the right to suspend or terminate accounts that violate these Terms or misuse the platform. Upon termination, your data may be retained for a short period before being permanently deleted.

---

## 15. Governing Law

These Terms are governed by the **laws of Malaysia**. Any disputes will be subject to the **exclusive jurisdiction of the courts of Malaysia**.

---

## 16. Changes to These Terms

We may update these Terms at any time. Your continued use of the service after updates are published constitutes your acceptance of the revised Terms.

---

## 17. Contact

For any legal or operational questions:

**queuein (Development Version)**  
Developer: KM LEONG
Email: km_dev@hotmail.com

---

## ⚠️ Final Disclaimer

queuein is an **alpha-stage service** provided “as is” and without warranty. You use the platform entirely at your own risk and discretion. We appreciate your participation and feedback as we work to make queuein secure, stable, and production-ready.

---
