import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — RAVEN',
  description: 'How RAVEN collects, uses, and protects consumer data for borrower verification.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="legal" dangerouslySetInnerHTML={{ __html: content }} />
  );
}

const content = `
<h1>Privacy Policy</h1>
<p class="last-updated">Last updated: March 24, 2026</p>

<h2>1. Introduction</h2>
<p>RAVEN ("we," "our," or "us") operates the Real-time Aggregation and Verification Engine at reportraven.tech. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.</p>

<h2>2. Information We Collect</h2>

<h3>2.1 Information Provided by Our Customers</h3>
<p>Our customers (financial institutions, lenders, and other authorized businesses) submit consumer information to our platform for verification and enrichment purposes. This may include:</p>
<ul>
  <li><strong>Identity information:</strong> Name, date of birth, Social Security Number, government-issued IDs</li>
  <li><strong>Contact information:</strong> Email address, phone number, mailing address</li>
  <li><strong>Financial information:</strong> Bank account details, income, assets</li>
  <li><strong>Credit information:</strong> Credit scores, payment history, open accounts</li>
  <li><strong>Employment information:</strong> Employer, job title, salary, employment history</li>
  <li><strong>Residence information:</strong> Property details, ownership status, address history</li>
  <li><strong>Education information:</strong> Enrollment status, degrees, institutions attended</li>
</ul>

<h3>2.2 Information from Third-Party Data Providers</h3>
<p>We obtain consumer information from authorized third-party data providers to verify and enrich the information submitted by our customers. These providers include credit bureaus, identity verification services, financial data aggregators, property data services, and employment verification services.</p>

<h3>2.3 Information Collected Automatically</h3>
<p>When you interact with our verification forms, we collect:</p>
<ul>
  <li>IP address and browser information</li>
  <li>Form interaction timestamps</li>
  <li>Verification attempt records</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
  <li>Verify consumer identity on behalf of our authorized customers</li>
  <li>Enrich consumer records with data from verified third-party sources</li>
  <li>Provide lending decisioning support to financial institutions</li>
  <li>Maintain audit trails for regulatory compliance</li>
  <li>Detect and prevent fraud</li>
  <li>Improve our services</li>
</ul>

<h2>4. Legal Basis for Processing</h2>
<p>We process personal information under the following legal bases:</p>
<ul>
  <li><strong>Consent:</strong> When you provide consent through our verification forms</li>
  <li><strong>Legitimate interest:</strong> To provide services to our customers for fraud prevention and lending decisions</li>
  <li><strong>Legal obligation:</strong> To comply with FCRA, GLBA, FERPA, and other applicable regulations</li>
  <li><strong>Contractual necessity:</strong> To fulfill our obligations to our business customers</li>
</ul>

<h2>5. Data Security</h2>
<p>We implement industry-standard security measures to protect your information:</p>
<ul>
  <li><strong>Encryption at rest:</strong> All consumer data is encrypted using AES-256-GCM with per-user data encryption keys managed through AWS KMS (envelope encryption)</li>
  <li><strong>Encryption in transit:</strong> All data transmitted via TLS 1.2 or higher</li>
  <li><strong>Access controls:</strong> Multi-tenant API key authentication ensures each customer can only access their authorized data</li>
  <li><strong>Audit logging:</strong> Every data access and modification is recorded with full provenance</li>
</ul>

<h2>6. Data Sharing</h2>
<p>We share personal information only with:</p>
<ul>
  <li>The financial institution or business that initiated the verification request</li>
  <li>Third-party data providers as necessary to complete verification (under data processing agreements)</li>
  <li>Law enforcement or regulatory bodies when required by law</li>
</ul>
<p>We do not sell personal information.</p>

<h2>7. Data Retention</h2>
<p>See our <a href="/legal/data-retention">Data Retention and Disposal Policy</a> for detailed information on how long we retain data and how it is disposed of.</p>

<h2>8. Your Rights</h2>
<p>Depending on your jurisdiction, you may have the right to:</p>
<ul>
  <li>Access the personal information we hold about you</li>
  <li>Request correction of inaccurate information</li>
  <li>Request deletion of your information</li>
  <li>Object to or restrict processing</li>
  <li>Data portability</li>
  <li>Withdraw consent</li>
</ul>
<p>To exercise these rights, contact us at privacy@reportraven.tech.</p>

<h2>9. FCRA Compliance</h2>
<p>To the extent that our services involve consumer reports as defined by the Fair Credit Reporting Act (FCRA), we comply with all applicable FCRA requirements, including permissible purpose limitations, adverse action notice requirements, and consumer dispute resolution procedures.</p>

<h2>10. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify affected parties of any material changes by posting the updated policy on this page with a revised "Last updated" date.</p>

<h2>11. Contact Us</h2>
<p>If you have questions about this Privacy Policy, contact us at:</p>
<ul>
  <li>Email: privacy@reportraven.tech</li>
  <li>Web: reportraven.tech</li>
</ul>
`;
