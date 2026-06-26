#!/usr/bin/env bun
// Generates marketing/mailers/all-20-mailers.html
import { writeFileSync, readFileSync } from "fs";

const RPATH = `M2162.9,2626.4c17.1-6.3,35.7-13.6,48.6-20.1-51.8-.7-99,.5-146.3-2.5-162.9-10.5-321.8-40.2-475.8-94.7-166.9-59.1-321-140.7-453.7-259.6-62.1-55.7-115.4-118.4-149.3-195.7-26.4-60.1-37.6-122.5-21.4-187.2,40.1-160.7,200.7-247.3,361.8-218-40.9,6.9-78.6,15.9-111.1,38.7-32.7,22.9-58.8,51.1-72.2,91.7,36.3-26.9,91.2-50.3,120.1-51.6-2.5,1.9-4.3,3.6-6.4,5-68.4,45.2-101.9,109.3-103.6,190.8-1.5,69.4,23.3,130.2,60.2,187.1,59.4,91.5,140.5,160.3,231.8,217.9,111.4,70.2,231,119.8,354.7,155.9,104,30.3,211.3,49.4,320,51.4,13.3.2,26.7,0,40,0-6.1-6.8-12.7-10.1-19-13.8-49-29.3-81.5-73.1-106-123.2-29.6-60.7-58.7-122.2-87.8-183.2-61.6-129.2-138.6-248-238.7-351.1-71.7-73.8-152.5-134.8-247.9-174.8-6.9-2.9-11.5-7.8-15.8-13.5-29.2-38.3-54-79.1-69.9-124.8-20.3-58.6-22.5-117.4.7-175.8,26.8-67.4,77.5-111.8,140.8-143.3,59.7-29.7,123.7-45.2,189.1-56.1,85.4-14.3,171.3-19.1,257.7-11.2,26.4,2.4,52.3,8.2,79.6,12.8-1.6-3.8-2.4-6.2-3.5-8.4-2.8-5.4-5.4-10.8-8.6-16-37.3-61.5-87.7-110.2-148.5-148.2-110.1-68.9-232.1-98.4-360.2-105.6-33.6-1.9-61.3-9.6-89.6-30.3-109.5-80.1-233.4-107.2-367.7-91.9-103.9,11.8-197.9,48.4-283.8,107.6-91.3,62.8-170.3,141.4-263.4,201.4,1.3,3.6,3.6,2.7,5.4,2.8,70.6,3.8,138.8-11.9,207.7-25.2-142.7,75.7-262.1,171.7-303,338.1,41.4-38.3,88-67.6,140.8-87.1-39,42-68.8,89.9-92.5,141.4-79.6,173.1-94.5,354.4-61,539.8,31.9,177,108.7,333.6,226.4,469.8,6.6,7.6,13.6,14.9,20.7,22.1,6.6,6.8,13.5,13.3,23.1,22.7l254,162c139.8,87.7,294.6,130.1,457.6,141.8,166.5,12,330.1-7.8,489.8-57.3,12.2-3.8,24.1-8.5,36-13.1s19.2-8.2,28.5-13.1l114-60.6c31.6-16.8,64.3-31.5,97.9-43.8Z`;

const svgDark = `<svg class="mail-footer-logo" viewBox="0 0 3000 3000" fill="none"><circle cx="1500" cy="1500" r="1319.5" stroke="#000" stroke-width="109"/><path d="${RPATH}" fill="#000"/></svg>`;
const svgWhite = `<svg class="cover-logo-mark" viewBox="0 0 3000 3000" fill="none"><circle cx="1500" cy="1500" r="1319.5" stroke="white" stroke-width="109"/><path d="${RPATH}" fill="white"/></svg>`;

const products = `
        <div class="products-list">
          <div class="product-item">
            <div class="product-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#2e5897" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div>
            <div><div class="product-name">Digital Onboarding</div><div class="product-desc">Branded deposit account opening and loan pre-qualification in minutes. Mobile-first, in your bank's domain, with no off-brand subdomains.</div></div>
          </div>
          <div class="product-item">
            <div class="product-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#2e5897" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg></div>
            <div><div class="product-name">Online Loan Application</div><div class="product-desc">One front door for every product — mortgage, HELOC, personal, auto, business, and agricultural — in your branding, from first click to submitted file.</div></div>
          </div>
          <div class="product-item">
            <div class="product-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#2e5897" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><polyline points="9 12 11 14 15 10"/></svg></div>
            <div><div class="product-name">LO-Driven Data Collection + Verification</div><div class="product-desc">Identity, income, employment, and property verified in ~90 seconds via Plaid, Socure, Truework, and Melissa. Your loan officer receives a complete verified file — no document chase, no VOE calls.</div></div>
          </div>
        </div>
        <div class="integration-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>
          <span class="integration-note-text">Integrates with your existing core — FIS, Jack Henry, Fiserv, or similar. No rebuild, no rip-and-replace. RAVEN is a front-end layer that syncs verified data directly into the system you already run.</span>
        </div>`;

const contactBlock = `
        <div class="cta-contact">
          <div class="cta-contact-label">To talk through the numbers</div>
          <div class="cta-contact-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span class="cta-contact-val">isaac@reportraven.tech</span>
          </div>
          <div class="cta-contact-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span class="cta-contact-val">(229) 379-6131</span>
          </div>
        </div>`;

type GapStatus = "p" | "m" | "o";
interface Gap { ch: string; detail: string; st: GapStatus; }
interface Bank {
  nameCover: string;
  nameMailing: string;
  nameShort: string;
  recipient: string;
  title: string;
  street: string;
  cityStateZip: string;
  slug: string;
  rslug: string;
  cert: string;
  roiExp: string; roiCon: string; roiOpt: string;
  labor: string; pull: string;
  gaps: Gap[];
  gapSummary: string;
  leftTitle: string;
  ctaTitle: string;
  ctaNote: string;
}

const banks: Bank[] = [
  {
    nameCover: "Southern Bank<br>and Trust Company",
    nameMailing: "Southern Bank and Trust Company",
    nameShort: "Southern Bank",
    recipient: "Sondra McCorquodale",
    title: "CDO, Executive Vice President",
    street: "116 E. Main Street",
    cityStateZip: "Mount Olive, NC 28365",
    slug: "southern-bank-trust",
    rslug: "sondra-mccorquodale",
    cert: "15359",
    roiExp: "$405K", roiCon: "$225K", roiOpt: "$645K",
    labor: "~$394K", pull: "~$12K",
    gaps: [
      { ch: "Mortgage", detail: "Online but routes to a third-party domain — off-brand at the critical moment", st: "p" },
      { ch: "Personal / Auto / Boat", detail: "No apply path. Call or contact form only", st: "m" },
      { ch: "HELOC / Home Equity", detail: "Learn-more pages only. No application", st: "m" },
      { ch: "Business / Agricultural", detail: "Relationship manager call required. No digital intake", st: "m" },
      { ch: "Account Opening", detail: "32-character off-brand subdomain. Mobile abandonment near-certain", st: "m" },
      { ch: "Existing Customers", detail: "Digital banking is functional", st: "o" },
    ],
    gapSummary: "1 of 6 products available to start online today.",
    leftTitle: "What We'd Build for Southern Bank",
    ctaTitle: "See the Southern Bank Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Southern Bank's digital intake.",
  },
  {
    nameCover: "First Reliance<br>Bank",
    nameMailing: "First Reliance Bank",
    nameShort: "First Reliance",
    recipient: "Robert Marze",
    title: "EVP Technology",
    street: "2170 West Palmetto Street",
    cityStateZip: "Florence, SC 29501",
    slug: "first-reliance-bank",
    rslug: "robert-marze",
    cert: "76181",
    roiExp: "$225K", roiCon: "$125K", roiOpt: "$355K",
    labor: "~$218K", pull: "~$6K",
    gaps: [
      { ch: "Mortgage", detail: "Third-party portal (mymortgage-online.com) — off-brand, no embedded verification", st: "p" },
      { ch: "Personal / Auto", detail: "Phone or email intake only. No online application", st: "m" },
      { ch: "HELOC / Home Equity", detail: "Product page only. No application or rate tool", st: "m" },
      { ch: "Business / SBA", detail: "Contact a banker required. No digital front door", st: "m" },
      { ch: "Account Opening", detail: "Off-site redirect for new accounts. Not branded", st: "p" },
      { ch: "Existing Customers", detail: "Online and mobile banking functional", st: "o" },
    ],
    gapSummary: "1 of 6 products fully available to start online today.",
    leftTitle: "What We'd Build for First Reliance",
    ctaTitle: "See the First Reliance Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of First Reliance's digital intake.",
  },
  {
    nameCover: "Colony Bankcorp",
    nameMailing: "Colony Bankcorp",
    nameShort: "Colony Bank",
    recipient: "Daniel Rentz",
    title: "Chief Information Officer",
    street: "115 S Grant St",
    cityStateZip: "Fitzgerald, GA 31750",
    slug: "colony-bankcorp",
    rslug: "daniel-rentz",
    cert: "22257",
    roiExp: "$350K", roiCon: "$190K", roiOpt: "$555K",
    labor: "~$342K", pull: "~$8K",
    gaps: [
      { ch: "Mortgage", detail: "Third-party link — no embedded verification or branded application", st: "p" },
      { ch: "Consumer / Auto", detail: "Phone intake only across all 39 branches", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No online application. Call a branch", st: "m" },
      { ch: "Business / SBA", detail: "Relationship model — no digital intake for commercial credits", st: "m" },
      { ch: "Account Opening", detail: "Links to third-party provider. Off-brand handoff", st: "p" },
      { ch: "Existing Customers", detail: "Online banking and mobile functional", st: "o" },
    ],
    gapSummary: "1 of 6 products fully available to start online today.",
    leftTitle: "What We'd Build for Colony Bank",
    ctaTitle: "See the Colony Bank Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Colony Bank's digital intake.",
  },
  {
    nameCover: "Carolina Bank<br>&amp; Trust",
    nameMailing: "Carolina Bank &amp; Trust",
    nameShort: "Carolina Bank",
    recipient: "Rick Beasley",
    title: "Chairman &amp; CEO",
    street: "112 Main St",
    cityStateZip: "Lamar, SC 29069",
    slug: "carolina-bank-trust",
    rslug: "rick-beasley",
    cert: "16723",
    roiExp: "$130K", roiCon: "$70K", roiOpt: "$210K",
    labor: "~$124K", pull: "~$4K",
    gaps: [
      { ch: "Mortgage", detail: "Phone or email to a loan officer. No online application", st: "m" },
      { ch: "Personal / Auto / Farm", detail: "Branch visit or call required", st: "m" },
      { ch: "HELOC / Home Equity", detail: "Not listed as a standalone product online", st: "m" },
      { ch: "Business / Agricultural", detail: "Relationship banking only. No digital intake", st: "m" },
      { ch: "Account Opening", detail: "No online account opening found on site", st: "m" },
      { ch: "Existing Customers", detail: "Online banking available for existing accounts", st: "o" },
    ],
    gapSummary: "0 of 6 loan products available to start online today.",
    leftTitle: "What We'd Build for Carolina Bank",
    ctaTitle: "See the Carolina Bank Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Carolina Bank's digital intake.",
  },
  {
    nameCover: "Coastal States<br>Bank",
    nameMailing: "Coastal States Bank",
    nameShort: "Coastal States",
    recipient: "Larry DesPres",
    title: "EVP &amp; CIO",
    street: "5 Bow Circle",
    cityStateZip: "Hilton Head Island, SC 29928",
    slug: "coastal-states-bank",
    rslug: "larry-despres",
    cert: "57756",
    roiExp: "$305K", roiCon: "$170K", roiOpt: "$480K",
    labor: "~$297K", pull: "~$1K",
    gaps: [
      { ch: "Mortgage", detail: "Third-party application link — no branded intake or verification", st: "p" },
      { ch: "Personal / Consumer", detail: "No online application. Contact a banker", st: "m" },
      { ch: "HELOC / Home Equity", detail: "Product information only. No application link", st: "m" },
      { ch: "Business / CRE", detail: "Relationship model. All commercial starts with a call", st: "m" },
      { ch: "Account Opening", detail: "Off-site link. Not embedded in Coastal States' experience", st: "p" },
      { ch: "Existing Customers", detail: "Online banking functional", st: "o" },
    ],
    gapSummary: "1 of 6 products available to start online today.",
    leftTitle: "What We'd Build for Coastal States",
    ctaTitle: "See the Coastal States Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Coastal States' digital intake.",
  },
  {
    nameCover: "Oconee Federal<br>S&amp;L",
    nameMailing: "Oconee Federal Savings &amp; Loan",
    nameShort: "Oconee Federal",
    recipient: "David Stafford",
    title: "COO &amp; EVP",
    street: "201 N. Second St",
    cityStateZip: "Seneca, SC 29678",
    slug: "oconee-federal",
    rslug: "david-stafford",
    cert: "30111",
    roiExp: "$78K", roiCon: "$41K", roiOpt: "$126K",
    labor: "~$76K", pull: "~$4K",
    gaps: [
      { ch: "Mortgage", detail: "No online application — contact a loan officer by phone", st: "m" },
      { ch: "Personal / Consumer", detail: "Branch-based only. No digital intake", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No apply path on website", st: "m" },
      { ch: "Business", detail: "No digital business loan intake", st: "m" },
      { ch: "Account Opening", detail: "New accounts require branch visit", st: "m" },
      { ch: "Existing Customers", detail: "Online banking and mobile deposit functional", st: "o" },
    ],
    gapSummary: "0 of 6 loan products available to start online today.",
    leftTitle: "What We'd Build for Oconee Federal",
    ctaTitle: "See the Oconee Federal Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Oconee Federal's digital intake.",
  },
  {
    nameCover: "Anderson Brothers<br>Bank",
    nameMailing: "Anderson Brothers Bank",
    nameShort: "Anderson Brothers",
    recipient: "Stephanie Byrd",
    title: "Chief Technology Officer",
    street: "101 N Main St",
    cityStateZip: "Mullins, SC 29574",
    slug: "anderson-brothers-bank",
    rslug: "stephanie-byrd",
    cert: "9923",
    roiExp: "$320K", roiCon: "$175K", roiOpt: "$510K",
    labor: "~$311K", pull: "~$6K",
    gaps: [
      { ch: "Mortgage", detail: "Online application links to a third-party portal. Off-brand handoff", st: "p" },
      { ch: "Personal / Auto", detail: "No apply path. Call or visit a branch", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No online application", st: "m" },
      { ch: "Business / Agricultural", detail: "Relationship model — starts with a call to a lender", st: "m" },
      { ch: "Account Opening", detail: "Off-site provider. Not embedded in Anderson Brothers' brand", st: "p" },
      { ch: "Existing Customers", detail: "Digital banking functional across all branches", st: "o" },
    ],
    gapSummary: "1 of 6 products available to start online today.",
    leftTitle: "What We'd Build for Anderson Brothers",
    ctaTitle: "See the Anderson Brothers Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Anderson Brothers' digital intake.",
  },
  {
    nameCover: "Southern First<br>Bank",
    nameMailing: "Southern First Bank",
    nameShort: "Southern First",
    recipient: "Carl Francois",
    title: "Executive Director, BSA / Fraud / Compliance",
    street: "6 Verdae Blvd",
    cityStateZip: "Greenville, SC 29607",
    slug: "southern-first-bank",
    rslug: "carl-francois",
    cert: "35179",
    roiExp: "$700K", roiCon: "$380K", roiOpt: "$1.11M",
    labor: "~$681K", pull: "~$26K",
    gaps: [
      { ch: "Mortgage", detail: "Third-party application. Off-brand experience for a $4.4B bank", st: "p" },
      { ch: "Personal / Consumer", detail: "No unified apply path. Product-specific phone contacts", st: "m" },
      { ch: "HELOC / Home Equity", detail: "Request a meeting or call. No apply link", st: "m" },
      { ch: "Business / SBA", detail: "Commercial portal exists but no automated verification", st: "p" },
      { ch: "Account Opening", detail: "Online account opening available", st: "o" },
      { ch: "Existing Customers", detail: "Online and mobile banking fully functional", st: "o" },
    ],
    gapSummary: "2 of 6 products available to start online today.",
    leftTitle: "What We'd Build for Southern First",
    ctaTitle: "See the Southern First Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Southern First's digital intake.",
  },
  {
    nameCover: "South Atlantic<br>Bank",
    nameMailing: "South Atlantic Bank",
    nameShort: "South Atlantic Bank",
    recipient: "Brett Roth",
    title: "VP IT",
    street: "630 29th Ave N",
    cityStateZip: "Myrtle Beach, SC 29577",
    slug: "south-atlantic-bank",
    rslug: "brett-roth",
    cert: "58689",
    roiExp: "$671K", roiCon: "$387K", roiOpt: "$1.04M",
    labor: "~$662K", pull: "~$10K",
    gaps: [
      { ch: "Mortgage", detail: "Third-party portal — off-brand for a $1.9B coastal lender", st: "p" },
      { ch: "Personal / Auto / Boat", detail: "No apply path. Call or visit a branch", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No online application", st: "m" },
      { ch: "Business / CRE", detail: "Relationship banking — all commercial starts with a call", st: "m" },
      { ch: "Account Opening", detail: "Off-site link. Not embedded in South Atlantic's experience", st: "p" },
      { ch: "Existing Customers", detail: "Online and mobile banking functional", st: "o" },
    ],
    gapSummary: "1 of 6 products available to start online today.",
    leftTitle: "What We'd Build for South Atlantic Bank",
    ctaTitle: "See the South Atlantic Bank Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of South Atlantic Bank's digital intake.",
  },
  {
    nameCover: "The Conway<br>National Bank",
    nameMailing: "The Conway National Bank",
    nameShort: "Conway National",
    recipient: "Monica Allen",
    title: "Electronic Banking Manager",
    street: "1400 Third Ave",
    cityStateZip: "Conway, SC 29526",
    slug: "conway-national-bank",
    rslug: "monica-allen",
    cert: "2102",
    roiExp: "$634K", roiCon: "$312K", roiOpt: "$1.05M",
    labor: "~$627K", pull: "~$7K",
    gaps: [
      { ch: "Mortgage", detail: "Third-party link — no embedded verification or in-branch brand", st: "p" },
      { ch: "Personal / Consumer", detail: "No digital application. Contact a banker", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No apply path on site", st: "m" },
      { ch: "Business / Commercial", detail: "All commercial applications start with a phone call", st: "m" },
      { ch: "Account Opening", detail: "Online account opening available", st: "o" },
      { ch: "Existing Customers", detail: "Digital banking is functional — rated strong in the market", st: "o" },
    ],
    gapSummary: "2 of 6 products available to start online today.",
    leftTitle: "What We'd Build for Conway National",
    ctaTitle: "See the Conway National Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Conway National's digital intake.",
  },
  {
    nameCover: "Bank of<br>Travelers Rest",
    nameMailing: "Bank of Travelers Rest",
    nameShort: "Travelers Rest Bank",
    recipient: "Eric Wall",
    title: "SVP Marketing",
    street: "42 Plaza Dr",
    cityStateZip: "Travelers Rest, SC 29690",
    slug: "bank-of-travelers-rest",
    rslug: "eric-wall",
    cert: "16389",
    roiExp: "$207K", roiCon: "$105K", roiOpt: "$340K",
    labor: "~$203K", pull: "~$4K",
    gaps: [
      { ch: "Mortgage", detail: "mymortgage-online.com portal — third-party, off-brand, no verification", st: "p" },
      { ch: "Personal / Auto", detail: "No online application. Phone or branch only", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No apply path. Contact a loan officer", st: "m" },
      { ch: "Business / C&amp;I", detail: "Relationship model — no digital intake", st: "m" },
      { ch: "Account Opening", detail: "Off-site redirect for new deposit accounts", st: "p" },
      { ch: "Existing Customers", detail: "Online banking functional", st: "o" },
    ],
    gapSummary: "1 of 6 products available to start online today.",
    leftTitle: "What We'd Build for Travelers Rest Bank",
    ctaTitle: "See the Travelers Rest Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Bank of Travelers Rest's digital intake.",
  },
  {
    nameCover: "Security Federal<br>Bank",
    nameMailing: "Security Federal Bank",
    nameShort: "Security Federal",
    recipient: "Ashley Thomas",
    title: "VP Marketing",
    street: "1705 Whiskey Rd",
    cityStateZip: "Aiken, SC 29803",
    slug: "security-federal-bank",
    rslug: "ashley-thomas",
    cert: "31100",
    roiExp: "$613K", roiCon: "$333K", roiOpt: "$979K",
    labor: "~$602K", pull: "~$11K",
    gaps: [
      { ch: "Mortgage", detail: "ICE Mortgage portal exists — but no automated income or asset verification", st: "p" },
      { ch: "Personal / Consumer", detail: "No digital application. Call or visit a branch", st: "m" },
      { ch: "HELOC / Home Equity", detail: "Product page only. No application link", st: "m" },
      { ch: "Business / SBA", detail: "No digital commercial intake", st: "m" },
      { ch: "Account Opening", detail: "Off-site link for new accounts. Not embedded", st: "p" },
      { ch: "Existing Customers", detail: "Online banking and mobile functional", st: "o" },
    ],
    gapSummary: "1 of 6 products available to start online today.",
    leftTitle: "What We'd Build for Security Federal",
    ctaTitle: "See the Security Federal Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Security Federal's digital intake.",
  },
  {
    nameCover: "Coastal Carolina<br>National Bank",
    nameMailing: "Coastal Carolina National Bank",
    nameShort: "CCNB",
    recipient: "Gina Coltrane",
    title: "Mortgage Technology",
    street: "1012 38th Ave N",
    cityStateZip: "Myrtle Beach, SC 29577",
    slug: "coastal-carolina-national-bank",
    rslug: "gina-coltrane",
    cert: "58864",
    roiExp: "$287K", roiCon: "$150K", roiOpt: "$464K",
    labor: "~$279K", pull: "~$8K",
    gaps: [
      { ch: "Mortgage", detail: "Application portal exists — but income and asset verification still manual", st: "p" },
      { ch: "Personal / Consumer", detail: "No unified apply path on site", st: "m" },
      { ch: "HELOC / Home Equity", detail: '"We Can Do That" brand but no apply link for HELOCs', st: "m" },
      { ch: "Business / Commercial", detail: "No digital commercial application", st: "m" },
      { ch: "Account Opening", detail: "Off-site link. Not embedded in CCNB's experience", st: "p" },
      { ch: "Existing Customers", detail: "Online banking functional", st: "o" },
    ],
    gapSummary: "1 of 6 products available to start online today.",
    leftTitle: "What We'd Build for CCNB",
    ctaTitle: "See the CCNB Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of CCNB's digital intake.",
  },
  {
    nameCover: "First Capital<br>Bank",
    nameMailing: "First Capital Bank",
    nameShort: "First Capital Bank",
    recipient: "Alicia Green",
    title: "CTO",
    street: "304 Meeting St",
    cityStateZip: "Charleston, SC 29401",
    slug: "first-capital-bank-charleston",
    rslug: "alicia-green",
    cert: "34966",
    roiExp: "$537K", roiCon: "$309K", roiOpt: "$837K",
    labor: "~$530K", pull: "~$7K",
    gaps: [
      { ch: "Mortgage", detail: "No online application — every loan starts with an email or phone call", st: "m" },
      { ch: "Personal / Consumer", detail: "No digital intake. Phone or email only", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No apply path", st: "m" },
      { ch: "Business / CRE", detail: "All commercial applications start with a relationship call", st: "m" },
      { ch: "Account Opening", detail: "No online account opening found on site", st: "m" },
      { ch: "Existing Customers", detail: "Online banking functional", st: "o" },
    ],
    gapSummary: "0 of 6 products available to start online today.",
    leftTitle: "What We'd Build for First Capital Bank",
    ctaTitle: "See the First Capital Bank Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of First Capital Bank's digital intake.",
  },
  {
    nameCover: "First Palmetto<br>Bank",
    nameMailing: "First Palmetto Bank",
    nameShort: "First Palmetto",
    recipient: "Karen Eckerd",
    title: "SVP",
    street: "407 DeKalb St",
    cityStateZip: "Camden, SC 29020",
    slug: "first-palmetto-bank",
    rslug: "karen-eckerd",
    cert: "28396",
    roiExp: "$374K", roiCon: "$200K", roiOpt: "$599K",
    labor: "~$362K", pull: "~$12K",
    gaps: [
      { ch: "Mortgage", detail: "Phone or email to a Mortgage Banker — no embedded apply link", st: "m" },
      { ch: "Personal / Auto", detail: "No digital application across 22 branches", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No apply path", st: "m" },
      { ch: "Business / SBA", detail: "CLIMB Fund partnership but no digital intake", st: "m" },
      { ch: "Account Opening", detail: "Off-site redirect. Not branded as First Palmetto", st: "p" },
      { ch: "Existing Customers", detail: "Online banking and mobile functional", st: "o" },
    ],
    gapSummary: "0 of 6 loan products available to start online today.",
    leftTitle: "What We'd Build for First Palmetto",
    ctaTitle: "See the First Palmetto Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of First Palmetto's digital intake.",
  },
  {
    nameCover: "Beacon Community<br>Bank",
    nameMailing: "Beacon Community Bank",
    nameShort: "Beacon",
    recipient: "Devani R.",
    title: "AVP Digital Banking",
    street: "578 East Bay St Ste D",
    cityStateZip: "Charleston, SC 29403",
    slug: "beacon-community-bank",
    rslug: "devani-r",
    cert: "59106",
    roiExp: "$413K", roiCon: "$214K", roiOpt: "$671K",
    labor: "~$403K", pull: "~$9K",
    gaps: [
      { ch: "Mortgage", detail: "Mortgage page returns a 404 — no application path exists", st: "m" },
      { ch: "Personal / Consumer", detail: "Phone or email only. No digital intake", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No apply path", st: "m" },
      { ch: "Business / Commercial", detail: "Relationship banking — starts with a call", st: "m" },
      { ch: "Account Opening", detail: "Off-site link. Not embedded in Beacon's experience", st: "p" },
      { ch: "Existing Customers", detail: "Digital banking functional — bill pay, mobile deposit", st: "o" },
    ],
    gapSummary: "0 of 6 loan products available to start online today.",
    leftTitle: "What We'd Build for Beacon",
    ctaTitle: "See the Beacon Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Beacon Community Bank's digital intake.",
  },
  {
    nameCover: "Queensborough<br>National Bank &amp; Trust",
    nameMailing: "Queensborough National Bank &amp; Trust Company",
    nameShort: "Queensborough",
    recipient: "Kendra Patrick",
    title: "AVP Digital Banking",
    street: "113 E Broad St",
    cityStateZip: "Louisville, GA 30434",
    slug: "queensborough-national-bank",
    rslug: "kendra-patrick",
    cert: "2138",
    roiExp: "$867K", roiCon: "$467K", roiOpt: "$1.39M",
    labor: "~$857K", pull: "~$11K",
    gaps: [
      { ch: "Mortgage", detail: "No online application — all mortgages start at a branch or by phone", st: "m" },
      { ch: "Personal / Consumer", detail: "No digital intake path across 27 branches", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No apply link on site", st: "m" },
      { ch: "Business / CRE", detail: "No digital commercial application. Branch visit required", st: "m" },
      { ch: "Account Opening", detail: "QNBTNOW mobile app available for existing customers", st: "p" },
      { ch: "Existing Customers", detail: "QNBTNOW digital banking is functional", st: "o" },
    ],
    gapSummary: "0 of 6 loan products available to start online today.",
    leftTitle: "What We'd Build for Queensborough",
    ctaTitle: "See the Queensborough Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Queensborough's digital intake.",
  },
  {
    nameCover: "First Community<br>Bank",
    nameMailing: "First Community Bank",
    nameShort: "First Community",
    recipient: "Robin Brown",
    title: "EVP Marketing",
    street: "5661 Kingsley Drive",
    cityStateZip: "Irmo, SC 29063",
    slug: "first-community-bank-sc",
    rslug: "robin-brown",
    cert: "34047",
    roiExp: "$1.04M", roiCon: "$581K", roiOpt: "$1.63M",
    labor: "~$1.02M", pull: "~$19K",
    gaps: [
      { ch: "Mortgage", detail: "Online application available but no automated income or asset verification", st: "p" },
      { ch: "Personal / Consumer", detail: "No digital intake — contact a banker", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No apply path on site", st: "m" },
      { ch: "Business / CRE", detail: "Relationship model — $904M CRE book, all manual intake", st: "m" },
      { ch: "Account Opening", detail: "Online account opening available", st: "o" },
      { ch: "Existing Customers", detail: "Online banking functional across all 23 offices", st: "o" },
    ],
    gapSummary: "2 of 6 products available to start online today.",
    leftTitle: "What We'd Build for First Community",
    ctaTitle: "See the First Community Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of First Community Bank's digital intake.",
  },
  {
    nameCover: "Countybank",
    nameMailing: "Countybank",
    nameShort: "Countybank",
    recipient: "Tyler Davis",
    title: "VP IT",
    street: "419 Main St",
    cityStateZip: "Greenwood, SC 29646",
    slug: "countybank",
    rslug: "tyler-davis",
    cert: "9155",
    roiExp: "$381K", roiCon: "$210K", roiOpt: "$605K",
    labor: "~$375K", pull: "~$6K",
    gaps: [
      { ch: "Mortgage", detail: "Loan officers listed but no embedded apply link or digital intake", st: "m" },
      { ch: "Personal / Consumer", detail: "No digital application. Phone or branch", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No apply path", st: "m" },
      { ch: "Business / SBA", detail: "Top SC SBA lender — but all intake is manual", st: "m" },
      { ch: "Account Opening", detail: "Off-site link for new accounts", st: "p" },
      { ch: "Existing Customers", detail: "Digital banking functional", st: "o" },
    ],
    gapSummary: "0 of 6 loan products available to start online today.",
    leftTitle: "What We'd Build for Countybank",
    ctaTitle: "See the Countybank Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Countybank's digital intake.",
  },
  {
    nameCover: "Optus Bank",
    nameMailing: "Optus Bank",
    nameShort: "Optus Bank",
    recipient: "Jamel Roberts",
    title: "VP Investor Relations",
    street: "1241 Main St Ste 100",
    cityStateZip: "Columbia, SC 29209",
    slug: "optus-bank",
    rslug: "jamel-roberts",
    cert: "35241",
    roiExp: "$224K", roiCon: "$117K", roiOpt: "$363K",
    labor: "~$220K", pull: "~$4K",
    gaps: [
      { ch: "Mortgage", detail: "No online application — 2 branches, all intake by appointment", st: "m" },
      { ch: "Personal / Consumer", detail: "No digital apply path", st: "m" },
      { ch: "HELOC / Home Equity", detail: "No apply link", st: "m" },
      { ch: "Business / Commercial", detail: "Relationship model — contact a banker", st: "m" },
      { ch: "Account Opening", detail: "Off-site redirect for new accounts", st: "p" },
      { ch: "Existing Customers", detail: "Online banking functional", st: "o" },
    ],
    gapSummary: "0 of 6 loan products available to start online today.",
    leftTitle: "What We'd Build for Optus Bank",
    ctaTitle: "See the Optus Bank Experience Live",
    ctaNote: "Includes the ROI model, experience analysis, and a live demo of Optus Bank's digital intake.",
  },
];

function qr(slug: string, rslug: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Freportraven.tech%2Faudit%2F${slug}%3Futm_source%3Ddirect-mail%26utm_medium%3Dmailer%26utm_campaign%3D${slug}%26utm_term%3D${rslug}%26utm_content%3Dqr&bgcolor=ffffff&color=0f172a&margin=4&qzone=1`;
}

function stIcon(st: GapStatus): string {
  if (st === "p") return `<span class="st-p">◐</span>`;
  if (st === "m") return `<span class="st-m">✗</span>`;
  return `<span class="st-o">✓</span>`;
}

function gapRows(gaps: Gap[]): string {
  return gaps.map(g => `            <tr>
              <td class="g-ch">${g.ch}</td>
              <td class="g-detail">${g.detail}</td>
              <td class="g-st">${stIcon(g.st)}</td>
            </tr>`).join("\n");
}

function bankHtml(b: Bank, idx: number): string {
  const isFirst = idx === 0;
  const labelClass = isFirst ? `class="sheet-label"` : `class="sheet-label"`;
  return `
<!-- ═══ BANK ${idx + 1}: ${b.nameMailing} ═══ -->
<p ${labelClass}>Side A — Outside — ${b.nameMailing}</p>
<div class="sheet">
  <div class="panel panel-mailing">
    <div class="mail-return">
      <strong>RAVEN</strong>
      isaac@reportraven.tech<br>
      (229) 379-6131
    </div>
    <div class="mail-stamp"><span>First&#8209;Class<br>Mail<br>Postage<br>Here</span></div>
    <div class="mail-to">
      <div class="mail-to-name">${b.recipient}</div>
      <div class="mail-to-title">${b.title}</div>
      <div class="mail-to-bank">${b.nameMailing}</div>
      <div class="mail-to-addr">${b.street}<br>${b.cityStateZip}</div>
    </div>
    <div class="mail-footer">
      ${svgDark}
      <span class="mail-footer-url">reportraven.tech</span>
    </div>
  </div>
  <div class="panel panel-cover">
    <div class="cover-logo-row">
      ${svgWhite}
      <span class="cover-logo-word">RAVEN</span>
    </div>
    <div class="cover-main">
      <div class="cover-eyebrow">Digital Lending Audit</div>
      <div class="cover-bank-name">${b.nameCover}</div>
      <div class="cover-date">June 2026</div>
      <div class="cover-rule"></div>
      <div class="cover-tagline"><strong>Automated borrower verification,</strong> white-labeled in your brand and integrated with your existing core.</div>
      <div class="cover-caps">
        <div class="cover-cap"><div class="cover-cap-dot"></div><span class="cover-cap-text">Digital onboarding and online loan application across all products</span></div>
        <div class="cover-cap"><div class="cover-cap-dot"></div><span class="cover-cap-text">LO-driven income, identity, and employment verification in 90 seconds</span></div>
        <div class="cover-cap"><div class="cover-cap-dot"></div><span class="cover-cap-text">Integrates with FIS, Jack Henry, Fiserv — no rebuild required</span></div>
      </div>
    </div>
    <div class="cover-footer">
      <span class="cover-footer-url">reportraven.tech</span>
      <span class="cover-footer-badge">Community bank infrastructure</span>
    </div>
  </div>
</div>

<p class="sheet-label">Side B — Inside — ${b.nameMailing}</p>
<div class="sheet">
  <div class="panel panel-inside">
    <div class="panel-half-top">
      <div class="sec-head"><span class="sec-head-label">${b.leftTitle}</span></div>
      <div class="sec-body">${products}</div>
    </div>
    <div class="sec-divider"></div>
    <div class="panel-half-bot">
      <div class="sec-head"><span class="sec-head-label">${b.ctaTitle}</span></div>
      <div class="sec-body">
        <p class="cta-intro">We built a working demo of what ${b.nameShort}'s borrower experience could look like — every product, your branding, the full verification flow. <strong>Scan or visit to walk through it.</strong></p>
        <div class="cta-qr-row">
          <img class="cta-qr-img" src="${qr(b.slug, b.rslug)}" alt="QR — reportraven.tech/audit/${b.slug}">
          <div>
            <div class="cta-scan-label">Full audit + live demo</div>
            <div class="cta-url">reportraven.tech/audit/<wbr>${b.slug}</div>
            <div class="cta-url-note">${b.ctaNote}</div>
          </div>
        </div>
        <div class="cta-flex"></div>
        ${contactBlock}
      </div>
    </div>
  </div>
  <div class="panel panel-inside panel-right">
    <div class="panel-half-top">
      <div class="sec-head"><span class="sec-head-label">What It's Worth</span></div>
      <div class="sec-body">
        <div class="roi-number">${b.roiExp}</div>
        <div class="roi-sublabel">estimated annual value — broken out below by driver</div>
        <div class="roi-drivers">
          <div class="roi-driver">
            <div class="roi-driver-left">
              <div class="roi-driver-label">Staff Time Saved</div>
              <div class="roi-driver-desc">Manual document collection eliminated per application across mortgage, commercial, and consumer loan files</div>
            </div>
            <div class="roi-driver-val">${b.labor}</div>
          </div>
          <div class="roi-driver">
            <div class="roi-driver-left">
              <div class="roi-driver-label">New Application Volume</div>
              <div class="roi-driver-desc">Additional originations from digital intake that does not exist today</div>
            </div>
            <div class="roi-driver-val">${b.pull}</div>
          </div>
        </div>
        <div class="roi-scenarios">
          <div class="roi-scen">
            <span class="roi-scen-label">Conservative</span>
            <span class="roi-scen-val">${b.roiCon}</span>
          </div>
          <div class="roi-scen expected">
            <span class="roi-scen-label">Expected ◉</span>
            <span class="roi-scen-val">${b.roiExp}</span>
          </div>
          <div class="roi-scen">
            <span class="roi-scen-label">Optimistic</span>
            <span class="roi-scen-val">${b.roiOpt}</span>
          </div>
        </div>
        <div class="roi-source">FDIC BankFind cert #${b.cert}, HMDA Modified LAR (2024), MBA performance benchmarks. Directional estimate only.</div>
      </div>
    </div>
    <div class="sec-divider"></div>
    <div class="panel-half-bot">
      <div class="sec-head"><span class="sec-head-label">Your Current Digital Experience</span></div>
      <div class="sec-body">
        <table class="gaps-table">
          <tbody>
${gapRows(b.gaps)}
          </tbody>
        </table>
        <div class="gaps-flex"></div>
        <div class="gaps-footer">
          <div class="gaps-summary">${b.gapSummary}</div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

const css = readFileSync(
  new URL("../marketing/mailers/southern-bank-trust.html", import.meta.url).pathname,
  "utf8"
).match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>RAVEN Audit Mailers — All 20 Banks</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
${banks.map((b, i) => bankHtml(b, i)).join("\n")}

<div class="instructions">
  <strong>Before printing</strong>
  <ol>
    <li>QR codes load from api.qrserver.com — requires internet access to display.</li>
    <li>Print in Chrome: File → Print · Paper: <strong>Letter</strong> · Orientation: <strong>Landscape</strong> · Margins: <strong>None</strong> · Background graphics: <strong>On</strong>.</li>
    <li>Each bank is two sheets: Side A (outside) then Side B (inside). Print all, then flip each sheet on the long edge to duplex manually, or use a duplex printer set to flip on long edge.</li>
    <li>Fold each sheet in half — cover faces out on the right.</li>
  </ol>
</div>

</body>
</html>`;

const outPath = new URL("../marketing/mailers/all-20-mailers.html", import.meta.url).pathname;
writeFileSync(outPath, html);
console.log(`Written ${html.length.toLocaleString()} chars to ${outPath}`);
