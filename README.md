# BTEB Result (btebresulthub.com)

A BTEB (Bangladesh Technical Education Board) result checker: individual, group and
institute results, latest-result statistics, CGPA and GPA calculators.
Built with Next.js (App Router), Tailwind CSS and MongoDB. Ready for Vercel.

## বাংলায় সংক্ষেপে: backend কীভাবে কাজ করে

সবচেয়ে গুরুত্বপূর্ণ কথা: **BTEB-এর কোনো public result API নেই।** তাই "API call করে result আনা" সম্ভব নয়, আর এখানেই সবাই আটকে যায়।

btebresultszone.com-এর মতো সাইটগুলো আসলে এভাবে কাজ করে:

1. BTEB প্রতিটি result একটি **PDF (result book)** হিসেবে bteb.gov.bd-তে প্রকাশ করে (বেশিরভাগ Google Drive folder-এ)।
2. সাইটের মালিক সেই PDF **download** করে।
3. একটি script PDF থেকে text বের করে এবং প্রতিটি roll-এর result **parse** করে।
4. সেই data নিজের **database**-এ (MongoDB) রাখে।
5. কেউ roll দিয়ে search করলে সাইট **নিজের database** থেকে result দেখায়, BTEB থেকে নয়।

এই project-এ সবগুলো ধাপ তৈরি করা আছে। নতুন result এলে শুধু একটি command চালাতে হবে:

```bash
npm run import -- ./pdfs/RESULT_5th_2022_Regulation.pdf --date 2026-11-10
```

Database ছাড়াও সাইট চলে (demo mode, নকল sample data দিয়ে), তাই আগে deploy করে দেখে নিতে পারবেন।

## How the backend works

```
bteb.gov.bd PDF  ->  scripts/import-pdf.ts  ->  MongoDB  ->  /api/*  ->  pages
 (result book)       (extract + parse)         (3 collections) (JSON)    (React)
```

### 1. The source is a PDF

Inside a result book the extracted text looks like this:

```
46080 - Fisheries Training and Extension Centre ,Faridpur     <- institute header
100339 ( 4.00 ) 100340 ( 3.97 ) 100341 ( 4.00 )                <- passed: roll ( GPA )
700117 {  6851(T) }  784730 { 25913 (T,P), 25921 (T) }        <- referred: roll { subjects }
```

`T` = theory, `P` = practical, `T,P` = both, `C` = continuous assessment.

### 2. The parser (`src/lib/parser.ts`)

A pure function, `parseResultText(text)`, walks the lines. An institute header sets
the "current institute"; every `roll ( gpa )` or `roll { subjects }` after it becomes
one entry belonging to that institute. It was verified against a real BTEB PDF.

### 3. The database (MongoDB)

| Collection     | One document is                    | Key fields                                                                 |
| -------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| `results`      | one roll in one PDF                | roll, curriculumId, semester, regulation, instituteCode, status, gpa, cgpa, referred[], date, fileName, fileHash |
| `publications` | one PDF file                       | fileName, fileHash, date, curriculumId, semester, stats{total, passed, referred} |
| `institutes`   | one institute                      | code, name, district                                                       |

A student who sat 8 semesters has at least 8 documents in `results`. The API groups
them by semester at query time.

### 4. The API (`src/app/api/*`)

| Endpoint                                                        | Returns                                   |
| --------------------------------------------------------------- | ----------------------------------------- |
| `GET /api/student-results?roll=700001&curriculumId=...`         | all semesters of one roll                 |
| `GET /api/group-results?rolls=700001,700002`                    | latest result of up to 50 rolls           |
| `GET /api/institute-results?instituteCode=99901&semester=4`     | every roll of an institute, per PDF       |
| `GET /api/latest-results?page=1`                                | publications grouped by date, with stats  |
| `GET /api/institutes?q=dhaka`                                   | institute search                          |
| `GET /api/health`                                               | active data source and row counts         |

All data access goes through `src/lib/repo.ts`. If `MONGODB_URI` is set it queries
MongoDB; otherwise it serves generated sample data from `src/lib/sample-data.ts`.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 and search roll `700001` (sample data).

## Go live with real data

1. Create a free cluster at MongoDB Atlas. Under Network Access allow `0.0.0.0/0`
   (Vercel has no fixed IP). Copy the connection string.
2. Copy `.env.example` to `.env.local` and set `MONGODB_URI`.
3. Create the indexes once:

   ```bash
   npm run db:setup
   ```

4. Download a result PDF from https://bteb.gov.bd (Results menu) into `./pdfs/`.
5. Check that it parses, without writing anything:

   ```bash
   npm run import -- ./pdfs/RESULT_5th_2022_Regulation.pdf --dry-run
   ```

6. Import it:

   ```bash
   npm run import -- ./pdfs/RESULT_5th_2022_Regulation.pdf --date 2026-11-10 --semester 5 --regulation 2022 --curriculum diploma_in_engineering
   ```

   Semester, regulation and curriculum are guessed from the file name when omitted.
   Add `--cgpa` for 8th-semester books whose numbers are the final CGPA.
   Importing the same PDF twice is safe (rows are upserted by file hash + roll).

Curriculum ids are listed in `src/lib/curricula.ts`.

## Deploy to Vercel

1. Push this folder to a GitHub repository (see below).
2. On vercel.com choose **Add New > Project** and import the repository.
   The framework is detected automatically; no build settings are needed.
3. Add environment variables from `.env.example` (`MONGODB_URI`, `MONGODB_DB`,
   `NEXT_PUBLIC_SITE_URL`).
4. Deploy, then add your domain under **Settings > Domains**.

The import script runs on your own computer, not on Vercel. It writes to the same
Atlas database the deployed site reads from, so new results appear immediately.

### Push to GitHub

```bash
git remote add origin https://github.com/<your-username>/btebresulthub.com.git
git push -u origin main
```

## Limits and notes

- Scanned (image-only) PDFs have no text layer and need OCR before they can be parsed.
- BTEB changes layouts occasionally. If `--dry-run` reports 0 students, open the PDF
  text and adjust the regular expressions at the top of `src/lib/parser.ts`.
- The Atlas free tier holds 512 MB, roughly 2 to 3 million result rows.
- This project is not affiliated with BTEB. Show the disclaimer and verify results
  against the official publication.
- Design and wording are original; do not copy another site's logo, name or text.

## Project structure

```
src/app/            pages and API routes
src/components/     Navbar, Footer, ResultCard, form controls
src/lib/parser.ts   PDF text -> structured rows
src/lib/repo.ts     data access (MongoDB or sample data)
src/lib/db.ts       MongoDB connection
src/lib/grade.ts    grading scale, CGPA weights, date helpers
scripts/            import-pdf.ts, setup-db.ts, sample-result-book.txt
```
