# **PRD — IndahTrack**

### **Personal Job Application Tracker**

**Version:** 1.0  
**Status:** Product Definition / Ready for Development  
**Target:** Personal project \+ small group of friends  
**Primary language:** Bahasa Indonesia, with English terminology where natural  
**Deployment target:** Vercel  
**Database/Auth:** Supabase  
**Initial cost target:** Rp0 / free tier

> **Catatan infrastruktur:** per September 2026, Vercel masih menyediakan Hobby `$0/month` untuk personal/non-commercial use, sedangkan Supabase Free menyediakan PostgreSQL 500 MB, hingga 50.000 MAU, 1 GB file storage, dan dua free projects; Supabase Free dapat melakukan pause project setelah satu minggu tidak aktif. Karena Vercel Hobby secara eksplisit ditujukan untuk penggunaan personal/non-commercial, PRD ini mengasumsikan IndahTrack tetap menjadi personal/friends project pada fase awal. ([Vercel](https://vercel.com/pricing?utm_source=chatgpt.com))

---

# **1\. Product Overview**

## **1.1 Product Name**

**IndahTrack**

Tagline:

> **Track every application. Understand your job search.**

IndahTrack adalah web application untuk membantu job seeker mencatat, mengelola, dan menganalisis seluruh proses pencarian kerja.

User dapat mencatat lowongan yang dilamar secara manual, kemudian memantau perkembangannya melalui recruitment pipeline:

Wishlist  
   ↓  
Applied  
   ↓  
Screening  
   ↓  
HR Interview  
   ↓  
Assessment  
   ↓  
User Interview  
   ↓  
Final Interview  
   ↓  
Offer  
   ↓  
Accepted  
   ↓  
Onboarding  
   ↓  
Completed

Dengan kemungkinan keluar kapan pun ke:

Rejected  
Withdrawn  
Ghosted

Produk bukan hanya berfungsi sebagai database lamaran, tetapi juga sebagai **personal job-search analytics platform**.

---

# **2\. Problem Statement**

Job seeker biasanya melamar ke banyak perusahaan melalui berbagai platform:

* LinkedIn  
* JobStreet  
* Glints  
* Indeed  
* Website perusahaan  
* Referral  
* Career fair  
* Email  
* dan sebagainya.

Setelah puluhan lamaran, user sering kehilangan informasi:

> “Saya sudah apply ke perusahaan ini belum?”

> “Yang mana sudah interview?”

> “Interview yang mana minggu depan?”

> “Berapa banyak lamaran saya yang sampai interview?”

> “Platform mana yang paling efektif?”

> “Kenapa saya sudah apply 50 perusahaan tapi baru 5 interview?”

Spreadsheet memang dapat digunakan, tetapi biasanya tidak memberikan pengalaman khusus untuk recruitment pipeline, timeline, reminder, dan analytics.

**IndahTrack menyelesaikan masalah tersebut dalam satu interface.**

---

# **3\. Product Goals**

## **Primary Goals**

### **G1 — Application Tracking**

User dapat mencatat seluruh job application dengan cepat.

### **G2 — Recruitment Pipeline**

User dapat mengetahui posisi setiap application dalam proses recruitment.

### **G3 — Timeline**

Setiap perpindahan stage tercatat sebagai history.

### **G4 — Dashboard**

User dapat melihat performa job search secara visual.

### **G5 — Follow-up**

User dapat mencatat dan mengingat action yang harus dilakukan.

### **G6 — Insights**

User mendapatkan insight berdasarkan data application mereka.

### **G7 — Simple & Fast**

Menambahkan sebuah lamaran baru idealnya dapat dilakukan dalam **≤30 detik**.

---

# **4\. Non-Goals**

Untuk MVP, IndahTrack **tidak** akan:

* melakukan scraping LinkedIn/JobStreet;  
* otomatis melamar pekerjaan;  
* menjadi job board;  
* menjadi ATS untuk perusahaan;  
* menjadi recruitment management system;  
* mengirim lamaran otomatis;  
* memproses CV menggunakan AI;  
* melakukan background check;  
* menjadi social network profesional.

Fokus utama adalah:

> **Tracking \+ Timeline \+ Analytics \+ Follow-up**

---

# **5\. Target Users**

## **Persona 1 — Active Job Seeker**

Mahasiswa/fresh graduate yang sedang melamar banyak pekerjaan.

Needs:

> “Saya butuh tahu semua application saya ada di tahap mana.”

---

## **Persona 2 — Experienced Job Seeker**

Orang yang melamar beberapa posisi sekaligus dan ingin membandingkan proses recruitment.

Needs:

> “Saya ingin tahu perusahaan mana yang paling responsif dan source mana yang menghasilkan interview.”

---

## **Persona 3 — Friends / Job Hunt Group**

Sekelompok teman yang sedang mencari pekerjaan bersama.

Needs:

> “Kami ingin punya platform yang sama tetapi data masing-masing tetap private.”

---

# **6\. Product Principles**

### **Simple**

Jangan membuat user mengisi informasi yang tidak dibutuhkan.

### **Fast**

Primary action harus membutuhkan interaksi minimal.

### **Data-driven**

Data application harus bisa menghasilkan insight.

### **Private by default**

Data job application milik user tidak boleh terlihat user lain.

### **Flexible**

Pipeline recruitment dapat berbeda antar perusahaan.

### **Progressive**

MVP sederhana tetapi arsitekturnya siap berkembang.

---

# **7\. Information Architecture**

IndahTrack  
│  
├── Public  
│   ├── Landing  
│   ├── Login  
│   └── Register  
│  
└── Authenticated  
    │  
    ├── Dashboard  
    │  
    ├── Applications  
    │   ├── All Applications  
    │   └── Application Detail  
    │  
    ├── Pipeline  
    │  
    ├── Follow-ups  
    │  
    ├── Insights  
    │  
    └── Settings  
        ├── Profile  
        ├── Job Search  
        ├── Pipeline  
        ├── Notifications  
        └── Appearance  
---

# **8\. Navigation**

## **Desktop**

Sidebar:

┌──────────────────────────┐  
│ ◆ IndahTrack             │  
│                          │  
│ OVERVIEW                 │  
│   Dashboard              │  
│                          │  
│ JOB SEARCH               │  
│   Applications           │  
│   Pipeline               │  
│   Follow-ups             │  
│   Insights               │  
│                          │  
│ ──────────────────────── │  
│ Settings                 │  
│                          │  
│ ──────────────────────── │  
│ 👤 User                  │  
└──────────────────────────┘

Primary CTA:

**\+ Add Application**

---

## **Mobile**

Bottom navigation:

┌─────────────────────────────────┐  
│                                 │  
│          Page content            │  
│                                 │  
├─────────────────────────────────┤  
│ Home  Jobs   \+   Pipeline  More │  
└─────────────────────────────────┘

`+` menjadi central action.

---

# **9\. Application Lifecycle**

Default pipeline:

Wishlist  
    ↓  
Applied  
    ↓  
Screening  
    ↓  
HR Interview  
    ↓  
Assessment  
    ↓  
User Interview  
    ↓  
Final Interview  
    ↓  
Offer  
    ↓  
Accepted  
    ↓  
Onboarding  
    ↓  
Completed

Closed outcomes:

Rejected  
Withdrawn  
Ghosted

Important distinction:

### **Stage**

Menjawab:

> “Sekarang prosesnya berada di tahap apa?”

### **Status**

Menjawab:

> “Bagaimana kondisi application tersebut?”

Contoh:

Stage: HR Interview  
Status: Active

atau:

Stage: Offer  
Status: Accepted  
---

# **10\. Stage Definitions**

| Stage | Definition |
| ----- | ----- |
| Wishlist | Job menarik tetapi belum dilamar |
| Applied | Application sudah dikirim |
| Screening | Recruiter/company sedang melakukan initial screening |
| HR Interview | Interview dengan recruiter/HR |
| Assessment | Test, coding test, psychological test, case study, etc. |
| User Interview | Interview dengan hiring manager/team |
| Final Interview | Tahap final/direktur/VP/founder |
| Offer | Perusahaan memberikan offer |
| Accepted | User menerima offer |
| Onboarding | User sedang menjalani onboarding |
| Completed | Recruitment journey selesai |
| Rejected | Perusahaan menolak application |
| Withdrawn | User menarik diri |
| Ghosted | Tidak ada perkembangan/respons setelah periode tertentu |

---

# **11\. Dashboard**

## **Purpose**

Menjawab pertanyaan:

> **“Bagaimana performa job search saya?”**

---

## **Dashboard layout**

### **Header**

Good morning, \[Name\] 👋

Here's your job search overview.

                     \[+ Add Application\]  
---

## **KPI Cards**

Applications  
42  
\+8 this week

Interviews  
12  
\+3 this week

Offers  
3  
\+1 this week

Rejected  
21  
\+4 this week

Additional KPI:

Active Applications  
Interview Conversion  
Offer Conversion  
Accepted  
Ghosted  
Withdrawn  
---

# **12\. Dashboard Charts**

## **12.1 Applications Over Time**

Line chart:

Applications  
│  
│                     ╭───╮  
│                 ╭───╯   ╰──╮  
│          ╭──────╯           ╰──  
│     ╭────╯  
│─────╯  
└──────────────────────────────  
      Week 1  Week 2  Week 3

Purpose:

Mengetahui apakah user aktif melamar secara konsisten.

---

# **13\. Application Status Distribution**

Donut/pie chart:

Active       14  
Interview     8  
Offer         3  
Rejected     21  
Withdrawn     2  
Ghosted       4  
---

# **14\. Recruitment Funnel**

Funnel menjadi salah satu component utama.

Applied  
████████████████████████ 42

Screening  
██████████████████       31

Interview  
██████████               18

Final Interview  
████                        8

Offer  
██                          3

Accepted  
█                           1

Metrics:

Applied → Interview  
42 → 18  
42.9%

Interview → Offer  
18 → 3  
16.7%

Offer → Accepted  
3 → 1  
33.3%  
---

# **15\. Recent Applications**

Dashboard menampilkan 5–10 application terakhir.

┌────────────────────────────────────┐  
│ 🟣 Tokopedia                       │  
│ Data Analyst Intern                │  
│ HR Interview                       │  
│ Applied Sep 05                     │  
└────────────────────────────────────┘

┌────────────────────────────────────┐  
│ 🟠 Shopee                          │  
│ Product Intern                     │  
│ Screening                          │  
│ Applied Sep 04                     │  
└────────────────────────────────────┘  
---

# **16\. Upcoming Follow-ups**

Upcoming

🔴 Today  
Shopee  
Follow up with recruiter

🟡 Tomorrow  
Tokopedia  
Prepare HR interview

⚪ Sep 14  
Traveloka  
Check application status  
---

# **17\. Application Management**

Route:

/applications

Default view: **Table**

Applications                         \+ Add Application

\[Search...\] \[Status\] \[Stage\] \[Source\] \[Date\]

Company       Position       Stage          Status  
────────────────────────────────────────────────────  
Tokopedia     Data Analyst   HR Interview   Active  
Shopee        Product Intern Screening      Active  
Traveloka     Data Analyst   User Interview Active  
Gojek         Business       Rejected        Closed  
---

# **18\. Application Views**

User dapat berpindah antara:

\[ Table \] \[ Cards \] \[ Board \]

### **Table**

Best untuk banyak application.

### **Cards**

Best untuk visual browsing.

### **Board**

Best untuk pipeline workflow.

---

# **19\. Search & Filter**

Search:

Search applications...

Search across:

* Company  
* Position  
* Notes

Filters:

Status  
Stage  
Source  
Employment Type  
Location  
Application Date

Sorting:

Newest  
Oldest  
Recently Updated  
Company A-Z  
Next Action  
---

# **20\. Add Application**

Primary UX harus berupa modal/slide-over.

### **Step 1**

Add Application

Company \*  
\[ Tokopedia \]

Position \*  
\[ Data Analyst Intern \]

Location  
\[ Jakarta / Hybrid \]

Employment Type  
\[ Internship ▼ \]

Source  
\[ LinkedIn ▼ \]

Application Date  
\[ 05 Sep 2026 \]

Job URL  
\[ https://... \]

           \[Cancel\] \[Add Application\]

Required:

Company  
Position  
Application Date

Optional:

Location  
Employment Type  
Source  
Job URL  
Salary  
Notes  
---

# **21\. Post-Creation Flow**

Setelah user menekan:

**Add Application**

system membuat application dengan:

stage \= Applied  
status \= Active

Kemudian:

Application added 🎉

What's the current stage?

● Applied  
○ Screening  
○ Interview  
○ Assessment  
○ Offer

Default:

**Applied**

Kemudian:

Would you like to create a follow-up?

☐ Follow up after 7 days  
---

# **22\. Application Detail**

Route:

/applications/\[id\]

Layout:

← Applications

Tokopedia  
Data Analyst Intern

📍 Jakarta / Hybrid  
💼 Internship  
🔗 LinkedIn  
📅 Applied Sep 05

\[ Update Stage \] \[ Edit \]

CURRENT STAGE

Applied → Screening → ● HR Interview  
                         ↓  
                  User Interview  
                         ↓  
                       Offer  
---

# **23\. Application Timeline**

Timeline bersifat append-only history.

Sep 05  
● Applied  
  Applied through LinkedIn

Sep 07  
● Screening  
  Recruiter contacted me

Sep 09  
● HR Interview  
  Scheduled for Sep 10

Setiap event menyimpan:

Stage  
Date  
Notes  
Created At  
---

# **24\. Update Stage**

Klik:

**Update Stage**

Current Stage  
HR Interview

Move to:

○ Assessment  
○ User Interview  
○ Final Interview  
○ Offer  
○ Accepted  
○ Rejected  
○ Withdrawn  
○ Ghosted

Jika memilih interview:

Interview Date  
Interview Type  
Meeting URL  
Interviewer  
Notes  
---

# **25\. Stage Transition Rules**

System tidak boleh menghapus timeline lama.

Contoh:

Application:  
Applied

setelah update:

Applied  
↓  
Screening

database tetap menyimpan:

Event 1 \= Applied  
Event 2 \= Screening

Bukan mengubah Event 1 menjadi Screening.

---

# **26\. Kanban Pipeline**

Route:

/pipeline

Columns dapat horizontal-scroll.

APPLIED       SCREENING      HR INTERVIEW

Tokopedia     Shopee         Company X  
Data Analyst  Product Intern  Business Intern

Traveloka  
Data Analyst

ASSESSMENT    USER INTERVIEW OFFER

Gojek         Company Y      Company Z  
---

# **27\. Drag & Drop**

User bisa:

Applied  
   ↓  
drag  
   ↓  
HR Interview

System menampilkan confirmation:

> Move Tokopedia to HR Interview?

Setelah confirm:

1. Update `current_stage`  
2. Create `application_event`  
3. Update `updated_at`  
4. Optional create interview/follow-up data

---

# **28\. Closed Applications**

Tidak dicampur dengan active pipeline.

Section:

Closed Applications

Accepted  
Rejected  
Withdrawn  
Ghosted  
Completed

User tetap dapat membuka detail application.

---

# **29\. Follow-ups**

Route:

/follow-ups

Sections:

OVERDUE  
TODAY  
UPCOMING  
COMPLETED

Example:

OVERDUE

🔴 Tokopedia  
Follow up with recruiter  
2 days overdue

TODAY

🟠 Shopee  
Prepare technical interview

UPCOMING

Sep 15  
Traveloka  
Check application status

Actions:

Complete  
Snooze  
Edit  
Open Application  
---

# **30\. Next Action**

Setiap application dapat memiliki:

Next Action

Contoh:

> Prepare technical interview

Fields:

Title  
Due date  
Reminder  
Completed

Relationship:

Application  
   │  
   └── Next Action

MVP dapat menggunakan satu active next action per application.

---

# **31\. Insights**

Route:

/insights

Header:

Job Search Insights

Period:  
\[ Last 30 Days ▼ \]  
---

## **KPI**

42  
Applications

18  
Interviews

3  
Offers

42.9%  
Interview Conversion

7.1%  
Offer Conversion  
---

# **32\. Applications by Source**

LinkedIn       ███████████████ 19  
JobStreet      ███████          9  
Glints         █████            6  
Referral       ████             5  
Company Site   ██               3

Metrics:

Total applications  
Interview conversion  
Offer conversion

per source.

---

# **33\. Applications by Position**

Example:

Data Analyst          17  
Business Analyst       9  
Product Analyst        7  
Data Scientist         5  
Other                  4  
---

# **34\. Stage Conversion**

Contoh:

Applied → Screening       73.8%  
Screening → Interview     58.1%  
Interview → Offer          16.7%  
Offer → Accepted           33.3%

Catatan penting:

Conversion calculation harus didefinisikan berdasarkan **distinct applications yang pernah mencapai stage**, bukan sekadar jumlah current cards.

---

# **35\. Response Time**

System menghitung:

Average Time to Screening  
Average Time to Interview  
Average Time to Offer

Contoh:

> Average time from Application → First Interview: **6.4 days**

---

# **36\. Job Search Insights**

Analytics engine dapat menghasilkan insight berbasis rule.

Contoh:

💡 LinkedIn generated the most interviews.

💡 Referrals have your highest interview conversion rate.

⚠️ 3 active applications haven't been updated in 14 days.

📈 You submitted 18% more applications this month.

🎯 Data Analyst applications have your highest interview rate.

MVP **tidak membutuhkan LLM/AI** untuk fitur ini.

Insight dapat dihasilkan menggunakan deterministic rules.

---

# **37\. Company View**

Company bukan menu utama pada MVP, tetapi database sudah mendukungnya.

Contoh:

Tokopedia

Applications: 3

Data Analyst Intern  
HR Interview

Business Analyst  
Rejected

Product Analyst  
Applied

Future metrics:

Average response time  
Number of applications  
Interview rate  
Offer rate  
---

# **38\. Settings**

## **Profile**

Name  
Email  
Avatar  
Timezone  
---

## **Job Search**

Default Employment Type  
Default Source  
Default Application Stage  
---

## **Pipeline**

☰ Wishlist  
☰ Applied  
☰ Screening  
☰ HR Interview  
☰ Assessment  
☰ User Interview  
☰ Final Interview  
☰ Offer

Actions:

Add Stage  
Rename  
Reorder  
Disable

MVP dapat menggunakan default pipeline terlebih dahulu, tetapi schema harus mendukung custom stages.

---

# **39\. Appearance**

Theme

○ Light  
○ Dark  
○ System  
---

# **40\. Authentication**

Authentication menggunakan **Supabase Auth**.

Supabase Auth menyediakan authentication/authorization dan terintegrasi dengan PostgreSQL serta Row Level Security (RLS). ([Supabase](https://supabase.com/docs/guides/auth?utm_source=chatgpt.com))

MVP:

Email  
Password

Future:

Google  
Magic Link

Authentication flow:

Register  
  ↓  
Supabase Auth  
  ↓  
Create Profile  
  ↓  
Dashboard  
---

# **41\. Multi-user Architecture**

Walaupun aplikasi digunakan bersama teman, default permission:

USER A  
 ├── Applications A  
 ├── Events A  
 └── Follow-ups A

USER B  
 ├── Applications B  
 ├── Events B  
 └── Follow-ups B

User A **tidak dapat membaca User B**.

---

# **42\. Future Shared Workspace**

Schema sebaiknya disiapkan untuk:

Workspace  
   │  
   ├── User A  
   ├── User B  
   └── User C

Tetapi fitur ini **Phase 2**, bukan MVP.

Kemungkinan UX:

My Workspace  
    ↓  
Job Hunt 2026  
    ├── Me  
    ├── Friend A  
    └── Friend B

User dapat memilih:

Personal  
Shared Workspace  
---

# **43\. Database Architecture**

Database utama:

**PostgreSQL — Supabase**

Core tables:

profiles  
companies  
applications  
application\_events  
application\_notes  
follow\_ups  
pipeline\_stages

Future:

workspaces  
workspace\_members  
interviews  
attachments  
notifications  
---

# **44\. Database Schema**

## **profiles**

profiles  
\---------  
id UUID PK  
full\_name TEXT  
avatar\_url TEXT  
timezone TEXT  
created\_at TIMESTAMPTZ  
updated\_at TIMESTAMPTZ

`id` mengacu ke Supabase Auth user ID.

---

# **45\. companies**

companies  
\---------  
id UUID PK  
name TEXT NOT NULL  
logo\_url TEXT  
website\_url TEXT  
location TEXT  
created\_at TIMESTAMPTZ  
updated\_at TIMESTAMPTZ

Unique rule:

normalized company name

untuk mencegah:

Tokopedia  
tokopedia  
TOKOPEDIA

menjadi company terpisah.

---

# **46\. pipeline\_stages**

pipeline\_stages  
\---------------  
id UUID PK  
user\_id UUID NULL  
name TEXT  
slug TEXT  
stage\_type TEXT  
position INT  
is\_system BOOLEAN  
is\_active BOOLEAN  
created\_at TIMESTAMPTZ

`user_id = NULL` dapat merepresentasikan default/system stage.

---

# **47\. applications**

applications  
\------------  
id UUID PK

user\_id UUID NOT NULL  
company\_id UUID NOT NULL

position TEXT NOT NULL  
location TEXT

employment\_type TEXT

source TEXT  
job\_url TEXT

salary\_min NUMERIC  
salary\_max NUMERIC  
salary\_currency TEXT

application\_date DATE NOT NULL

current\_stage\_id UUID NOT NULL  
status TEXT NOT NULL

notes TEXT

created\_at TIMESTAMPTZ  
updated\_at TIMESTAMPTZ  
---

# **48\. application\_events**

application\_events  
\------------------  
id UUID PK

application\_id UUID NOT NULL

stage\_id UUID NOT NULL

event\_date TIMESTAMPTZ NOT NULL

notes TEXT

metadata JSONB

created\_at TIMESTAMPTZ

`metadata` dapat menyimpan data tambahan seperti:

{  
  "interview\_type": "video",  
  "meeting\_url": "...",  
  "interviewer": "Recruiter"  
}

Namun data penting yang membutuhkan querying intensif sebaiknya tidak disembunyikan semuanya di JSONB.

---

# **49\. follow\_ups**

follow\_ups  
\----------  
id UUID PK

application\_id UUID NOT NULL  
user\_id UUID NOT NULL

title TEXT NOT NULL  
description TEXT

due\_at TIMESTAMPTZ

status TEXT

completed\_at TIMESTAMPTZ

created\_at TIMESTAMPTZ  
updated\_at TIMESTAMPTZ  
---

# **50\. Optional interviews table**

Saya merekomendasikan tabel ini sudah disiapkan meskipun UI MVP sederhana.

interviews  
\----------  
id UUID PK  
application\_id UUID NOT NULL

interview\_type TEXT  
scheduled\_at TIMESTAMPTZ

meeting\_url TEXT  
interviewer TEXT

notes TEXT

created\_at TIMESTAMPTZ  
updated\_at TIMESTAMPTZ

Ini akan mempermudah Phase 2\.

---

# **51\. Relationships**

auth.users  
    │  
    └── profiles  
          │  
          ├── applications  
          │       │  
          │       ├── company  
          │       │  
          │       ├── application\_events  
          │       │  
          │       ├── interviews  
          │       │  
          │       └── follow\_ups  
          │  
          └── pipeline\_stages  
---

# **52\. Security — RLS**

Semua user-owned tables harus menggunakan Supabase Row Level Security.

Konsep:

auth.uid() \= user\_id

Contoh secara konseptual:

CREATE POLICY "Users can view own applications"  
ON applications  
FOR SELECT  
USING (auth.uid() \= user\_id);

Dan:

CREATE POLICY "Users can create own applications"  
ON applications  
FOR INSERT  
WITH CHECK (auth.uid() \= user\_id);

Application events juga harus divalidasi melalui ownership application tersebut.

Tidak boleh hanya mengandalkan frontend untuk security.

---

# **53\. API / Data Flow**

Karena menggunakan Next.js \+ Supabase, tidak perlu backend server terpisah untuk MVP.

Flow:

React / Next.js UI  
       │  
       ▼  
Supabase Client  
       │  
       ▼  
Supabase Auth  
       │  
       ▼  
PostgreSQL \+ RLS

Untuk server-side privileged operations, gunakan server-side environment/API route hanya ketika benar-benar diperlukan.

---

# **54\. Recommended Tech Stack**

## **Frontend**

**Next.js**

App Router.

## **Language**

**TypeScript**

## **Styling**

**Tailwind CSS**

## **Components**

**shadcn/ui**

## **Icons**

**Lucide**

## **Charts**

**Recharts**

## **Drag & Drop**

**dnd-kit**

## **Backend / Database**

**Supabase**

## **Authentication**

**Supabase Auth**

## **Hosting**

**Vercel**

## **Validation**

**Zod**

## **Forms**

**React Hook Form**

---

# **55\. Why this stack?**

Tujuannya menjaga architecture tetap:

Simple  
Cheap  
Fast to develop  
Easy to maintain  
Scalable enough

Tidak membutuhkan:

Node backend server  
Redis  
Separate database server  
Docker  
Kubernetes  
AWS

untuk MVP.

---

# **56\. Project Structure**

Recommended:

app/  
├── (auth)/  
│   ├── login/  
│   └── register/  
│  
├── (dashboard)/  
│   ├── dashboard/  
│   ├── applications/  
│   ├── pipeline/  
│   ├── follow-ups/  
│   ├── insights/  
│   └── settings/  
│  
├── api/  
│   └── ...  
│  
components/  
├── dashboard/  
├── applications/  
├── pipeline/  
├── followups/  
├── insights/  
└── ui/

lib/  
├── supabase/  
├── validations/  
├── analytics/  
└── utils/

types/  
database.types.ts  
---

# **57\. Component Architecture**

Core reusable components:

AppShell  
Sidebar  
MobileNav  
Topbar

StatCard  
ChartCard  
EmptyState

ApplicationTable  
ApplicationCard  
ApplicationBoard  
ApplicationDetail  
ApplicationTimeline

AddApplicationModal  
EditApplicationModal  
UpdateStageModal

StageBadge  
StatusBadge

FollowUpCard  
FollowUpList

PipelineColumn  
PipelineCard

InsightCard  
---

# **58\. Empty States**

Empty states harus tetap informatif.

Dashboard ketika belum ada application:

Your job search starts here.

You haven't added any applications yet.

\[ \+ Add Your First Application \]

Pipeline:

No applications in this stage.

Follow-up:

You're all caught up 🎉

No pending follow-ups.  
---

# **59\. Loading States**

Gunakan skeleton:

┌───────────────────────┐  
│ ██████████            │  
│ █████                 │  
│                       │  
│ ███████████████       │  
└───────────────────────┘

Hindari spinner besar pada seluruh halaman.

---

# **60\. Error Handling**

Example:

Something went wrong.

We couldn't save this application.

\[ Try Again \]

Database error harus di-log developer-side tetapi user tidak perlu melihat technical SQL error.

---

# **61\. Toast Notifications**

Actions memberikan feedback:

Application added successfully.

Stage updated.

Follow-up completed.

Application deleted.  
---

# **62\. Delete Behavior**

Delete application harus memiliki confirmation.

Delete application?

This will permanently delete the application  
and its timeline history.

\[Cancel\] \[Delete\]

Untuk MVP:

**hard delete** dapat digunakan.

Future:

**soft delete / archive**.

---

# **63\. Application Duplication**

Future feature yang cukup berguna.

User bisa:

Duplicate Application

Untuk perusahaan/role yang sama tetapi requisition berbeda.

MVP belum wajib.

---

# **64\. Export / Import**

Phase 2:

Export CSV  
Import CSV

Use case:

User sebelumnya menggunakan spreadsheet.

Excel / Google Sheets  
        ↓  
     CSV  
        ↓  
   IndahTrack  
---

# **65\. Responsive Requirements**

Desktop:

≥ 1024px

Tablet:

768px – 1023px

Mobile:

\< 768px

Dashboard:

Desktop → 4-column KPI.

Tablet → 2-column.

Mobile → 1-column.

Pipeline mobile:

Horizontal scroll.

Application table mobile:

Transform menjadi card list.

---

# **66\. Accessibility**

Target:

**WCAG-friendly basic implementation**

Requirements:

* keyboard navigation;  
* visible focus;  
* semantic HTML;  
* accessible form labels;  
* sufficient contrast;  
* dialogs dapat ditutup dengan Escape;  
* buttons memiliki accessible labels;  
* charts memiliki text summary.

---

# **67\. Performance**

Target MVP:

Initial page load  
\< 2–3 seconds under normal conditions

Dashboard query  
\< 1 second target

Add application  
Near-instant UI feedback

Gunakan:

* database indexing;  
* server/client separation;  
* selective queries;  
* pagination;  
* lazy load untuk chart jika diperlukan.

---

# **68\. Recommended Database Indexes**

Minimal:

applications(user\_id)  
applications(user\_id, current\_stage\_id)  
applications(user\_id, status)  
applications(user\_id, application\_date)  
applications(company\_id)

application\_events(application\_id)  
application\_events(event\_date)

follow\_ups(user\_id, due\_at)  
follow\_ups(application\_id)  
---

# **69\. Analytics Calculation Rules**

## **Total Applications**

COUNT(applications)  
---

## **Active Applications**

status \= 'active'  
---

## **Interview Count**

Application dianggap mencapai interview jika pernah memiliki event stage:

HR Interview  
OR  
User Interview  
OR  
Final Interview  
---

## **Offer Count**

Application dianggap mencapai offer jika:

event stage \= Offer

meskipun kemudian rejected/withdrawn.

Ini penting.

Misalnya:

Offer → Rejected

tetap dihitung sebagai:

**1 Offer**

karena application memang pernah mendapatkan offer.

---

# **70\. Interview Conversion**

Applications that reached interview  
\-----------------------------------  
Total applications

Example:

18 / 42 \= 42.9%  
---

# **71\. Offer Conversion**

Applications that reached offer  
\--------------------------------  
Total applications

Example:

3 / 42 \= 7.1%  
---

# **72\. Acceptance Rate**

Accepted  
\--------  
Offers

Example:

1 / 3 \= 33.3%  
---

# **73\. Time to Interview**

Untuk setiap application:

first\_interview\_date \- application\_date

Kemudian:

AVG(time\_to\_first\_interview)  
---

# **74\. Ghosted Rule**

MVP:

Ghosted **hanya ketika user secara manual memilih Ghosted**.

Future:

System dapat memberikan suggestion:

> “This application hasn't been updated for 14 days. Mark as ghosted?”

Jangan otomatis mengubah status tanpa user confirmation.

---

# **75\. Notification Strategy**

MVP:

In-app reminder.

Future:

Email reminder.

Contoh:

Tomorrow

You have 2 follow-ups scheduled.

Email membutuhkan konfigurasi SMTP/email provider dan tidak perlu menjadi blocker MVP.

---

# **76\. Privacy**

Job application data dapat mengandung informasi sensitif seperti:

* salary;  
* interview notes;  
* recruiter names;  
* private URLs;  
* personal notes.

Maka:

**Default privacy \= private.**

Shared workspace tidak boleh otomatis membuat application terlihat anggota workspace.

---

# **77\. Security Requirements**

### **Must Have**

* Supabase Auth  
* RLS  
* HTTPS  
* Environment secrets tidak masuk git  
* Server-only secrets tidak dikirim ke client  
* Input validation  
* Authorization pada setiap mutation

### **Never**

service\_role key

ditaruh di frontend/client bundle.

---

# **78\. Environment Variables**

Development:

NEXT\_PUBLIC\_SUPABASE\_URL=  
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=

Server-only apabila diperlukan:

SUPABASE\_SERVICE\_ROLE\_KEY=

Service role hanya digunakan server-side dan tidak boleh exposed.

---

# **79\. Deployment Architecture**

GitHub  
   │  
   ▼  
Vercel  
   │  
   ├── Next.js  
   ├── CI/CD  
   └── Production deployment  
             │  
             ▼  
         Supabase  
          ├── Auth  
          ├── PostgreSQL  
          └── Storage

Vercel Hobby saat ini merupakan `$0/month` dan ditujukan untuk personal/non-commercial projects. ([Vercel](https://vercel.com/pricing?utm_source=chatgpt.com))

Supabase Free menyediakan database PostgreSQL gratis dengan limit 500 MB/project dan 50.000 MAU yang termasuk dalam plan tersebut. ([Supabase](https://supabase.com/pricing?utm_source=chatgpt.com))

---

# **80\. MVP Scope**

Saya akan mengunci MVP sebagai berikut.

## **P0 — Absolutely Required**

### **Authentication**

* Register  
* Login  
* Logout  
* Session handling

### **Applications**

* Add application  
* Edit application  
* Delete application  
* View application  
* Search  
* Filter

### **Pipeline**

* Default stages  
* Update stage  
* Timeline

### **Dashboard**

* Total applications  
* Active  
* Interviews  
* Offers  
* Rejected  
* Applications trend  
* Status chart  
* Funnel

### **Follow-up**

* Add follow-up  
* Due date  
* Complete  
* Overdue indication

### **Insights**

* Interview conversion  
* Offer conversion  
* Applications by source  
* Applications by position  
* Basic response-time analytics

### **Security**

* RLS  
* User-owned data isolation

---

# **81\. P1 — Immediately After MVP**

Custom pipeline stages  
Drag & drop Kanban  
Interview entity  
Interview calendar  
Salary analytics  
Company detail  
CSV export  
CSV import  
Dark mode refinement  
Advanced filtering  
---

# **82\. P2 — Advanced Product**

Shared workspace  
Friends/team analytics  
Email reminders  
AI job-search insights  
CV tracking  
Resume version tracking  
Job description storage  
Application documents  
Interview preparation  
Offer comparison  
Salary comparison  
---

# **83\. P3 — Potential Future Product**

Ini sudah bukan sekadar personal tracker:

Chrome extension  
LinkedIn quick-save  
Job board integrations  
AI auto-import  
Resume tailoring  
AI interview prep  
Application auto-population  
Calendar integrations  
Gmail integration  
Recruiter email tracking

Tetapi **jangan membangun bagian ini sekarang**.

---

# **84\. User Stories**

## **Authentication**

**US-001**

> As a user, I want to create an account so that my applications are private.

**Acceptance Criteria**

* User dapat register.  
* Email/password divalidasi.  
* User mendapat authenticated session.  
* Profile dibuat.

---

## **Add Application**

**US-002**

> As a user, I want to quickly add a job application.

**Acceptance Criteria**

* Company wajib.  
* Position wajib.  
* Application date wajib.  
* Setelah submit, application dibuat.  
* Initial stage \= Applied.  
* Initial status \= Active.

---

# **85\. Update Application**

**US-003**

> As a user, I want to move an application through recruitment stages.

Acceptance:

Applied → Screening

menciptakan event baru.

Current stage berubah.

Timeline tidak kehilangan history.

---

# **86\. View Timeline**

**US-004**

> As a user, I want to see the full history of an application.

Acceptance:

Timeline diurutkan descending.

Setiap event menampilkan:

Stage  
Date  
Notes  
---

# **87\. Track Follow-up**

**US-005**

> As a user, I want to create a follow-up task for an application.

Acceptance:

Task mempunyai:

title  
due date  
status  
application

User dapat complete.

---

# **88\. Dashboard**

**US-006**

> As a user, I want to see statistics about my applications.

Dashboard harus menampilkan:

Total  
Active  
Interview  
Offer  
Rejected

dan minimal:

Trend  
Status distribution  
Funnel  
---

# **89\. Insights**

**US-007**

> As a user, I want to know which application sources generate the best outcomes.

Acceptance:

Source analytics menampilkan:

Applications  
Interviews  
Interview %  
Offers  
Offer %  
---

# **90\. Privacy**

**US-008**

> As a user, I want only my own applications to be accessible from my account.

Acceptance:

User A tidak dapat SELECT/UPDATE/DELETE data User B, termasuk melalui direct API request.

---

# **91\. MVP Acceptance Criteria**

MVP dianggap selesai ketika:

### **A. Authentication**

Register ✅  
Login ✅  
Logout ✅  
Session persistence ✅

### **B. Application CRUD**

Create ✅  
Read ✅  
Update ✅  
Delete ✅

### **C. Pipeline**

Stage update ✅  
Timeline ✅  
Closed states ✅

### **D. Dashboard**

KPI ✅  
Charts ✅  
Funnel ✅  
Recent applications ✅

### **E. Follow-up**

Create ✅  
Complete ✅  
Overdue ✅

### **F. Security**

RLS ✅  
Private user data ✅

### **G. Deployment**

Production build ✅  
Vercel deployment ✅  
Supabase production DB ✅  
Environment variables ✅  
---

# **92\. Definition of Done**

Sebuah feature dianggap selesai apabila:

UI implemented  
        \+  
Validation implemented  
        \+  
Database implemented  
        \+  
Authorization implemented  
        \+  
Loading state  
        \+  
Error state  
        \+  
Empty state  
        \+  
Mobile responsive  
        \+  
Tested  
---

# **93\. Development Roadmap**

## **Sprint 0 — Foundation**

Initialize Next.js  
Supabase project  
Auth  
Tailwind  
shadcn/ui  
Database migration  
RLS  
Environment config  
---

## **Sprint 1 — Core Applications**

Application schema  
Company schema  
Add Application  
Application list  
Application detail  
Edit  
Delete  
Search  
Filter  
---

## **Sprint 2 — Pipeline**

Pipeline stages  
Stage transition  
Application events  
Timeline  
Closed states  
Kanban  
---

## **Sprint 3 — Dashboard**

KPI  
Status chart  
Application trend  
Funnel  
Recent applications  
---

## **Sprint 4 — Follow-ups**

Follow-up table  
Create  
Edit  
Complete  
Overdue  
Application integration  
---

## **Sprint 5 — Insights**

Source analytics  
Position analytics  
Conversion  
Response time  
Insight cards  
---

## **Sprint 6 — Polish**

Responsive  
Dark mode  
Animations  
Empty states  
Loading states  
Error handling  
Accessibility  
Performance  
---

## **Sprint 7 — Deployment**

GitHub  
Vercel  
Supabase production  
Domain/subdomain  
Environment variables  
Production QA  
---

# **94\. Design System**

## **Visual direction**

**Minimal productivity application**

Inspirasi visual:

Linear  
\+  
Notion  
\+  
Trello  
\+  
Modern career dashboard

Bukan:

Traditional HR software  
Enterprise ATS  
Corporate portal  
---

## **Typography**

Recommended:

**Geist** atau **Inter**

Hierarchy:

H1: 32–36px  
H2: 24–28px  
H3: 18–20px  
Body: 14–16px  
Caption: 12–13px  
---

# **95\. Color System**

Base:

Background: neutral  
Surface: white/dark surface  
Border: subtle neutral  
Text: high contrast

Status colors:

Applied       neutral  
Screening     blue  
Interview     purple  
Assessment    orange  
Offer         green  
Accepted      green  
Rejected      red  
Withdrawn     gray  
Ghosted       gray/orange

Warna status harus **tidak menjadi satu-satunya indikator**, karena accessibility.

---

# **96\. Microinteractions**

Contoh:

Ketika application dipindahkan:

Applied  
   ↓  
HR Interview

timeline dapat menambahkan event dengan animasi kecil.

Saat offer:

🎉 Offer received\!

boleh menggunakan subtle animation.

Jangan menggunakan animasi yang terlalu ramai.

---

# **97\. Empty Dashboard Example**

Good morning 👋

Your job search dashboard

                  🎯  
          Start tracking your  
          job applications

        Keep all your applications  
        organized in one place.

       \[+ Add Your First Application\]  
---

# **98\. Important Product Decision**

**Application event history adalah source of truth untuk analytics stage progression.**

Artinya jangan hanya melihat:

current\_stage \= Offer

untuk analytics.

System harus bisa mengetahui:

Applied  
→ Screening  
→ HR Interview  
→ Assessment  
→ User Interview  
→ Offer

Karena dari sana kita bisa menghitung:

Interview conversion  
Offer conversion  
Time to interview  
Time to offer  
Stage conversion

Ini adalah salah satu keputusan arsitektur paling penting dalam product ini.

---

# **99\. Another Important Decision**

**Jangan membuat status "Interview" sebagai satu field tunggal.**

Karena:

HR Interview  
User Interview  
Final Interview

memiliki makna berbeda.

Tetap gunakan:

Stage \= HR Interview

daripada:

Status \= Interview  
---

# **100\. Final Product Concept**

IndahTrack akhirnya menjadi:

                 IndahTrack  
                       │  
         ┌─────────────┼─────────────┐  
         │             │             │  
         ▼             ▼             ▼  
      TRACK          MANAGE        ANALYZE  
         │             │             │  
         ▼             ▼             ▼  
 Applications       Pipeline       Dashboard  
 Timeline            Follow-ups    Insights  
 Interviews          Actions       Conversion

Dan core loop-nya:

       FIND JOB  
           ↓  
        APPLY  
           ↓  
      ADD TO TRACKER  
           ↓  
      UPDATE STAGE  
           ↓  
       FOLLOW-UP  
           ↓  
       INTERVIEW  
           ↓  
         OFFER  
           ↓  
       ACCEPTED  
           ↓  
      ONBOARDING  
           ↓  
        INSIGHTS  
           │  
           └──────────────┐  
                          ↓  
                  Improve job-search  
                       strategy

### **Arsitektur final yang saya rekomendasikan**

                ┌───────────────────┐  
                 │     GitHub        │  
                 └────────┬──────────┘  
                          │  
                       CI/CD  
                          │  
                          ▼  
                 ┌───────────────────┐  
                 │      Vercel       │  
                 │                   │  
                 │ Next.js           │  
                 │ React             │  
                 │ Tailwind          │  
                 │ shadcn/ui         │  
                 └────────┬──────────┘  
                          │  
                          ▼  
                 ┌───────────────────┐  
                 │     Supabase      │  
                 │                   │  
                 │ Auth              │  
                 │ PostgreSQL        │  
                 │ RLS               │  
                 │ Storage           │  
                 └───────────────────┘

Dengan desain ini, **MVP tetap sangat realistis untuk project personal**, tetapi database dan product model tidak akan menghambat kita ketika nanti ingin menambahkan shared workspace, interview calendar, email reminder, CSV import/export, bahkan AI.

Satu catatan operasional: Supabase Free saat ini memiliki 2 free projects dan project dapat dipause setelah 1 minggu tidak aktif, jadi untuk deployment personal kita sebaiknya memperlakukan free tier sebagai **development/personal hosting**, bukan SLA production. ([Supabase](https://supabase.com/pricing?utm_source=chatgpt.com))

**PRD ini sudah cukup lengkap untuk dijadikan sumber implementasi.** Tahap engineering berikutnya secara natural adalah membuat **database migration/schema SQL Supabase \+ RLS policies \+ struktur folder Next.js \+ route map \+ TypeScript types \+ backlog task yang bisa langsung dikerjakan satu per satu**.

