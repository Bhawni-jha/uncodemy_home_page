# How things work

## Adding questions to a course (you, in the code)
Open `js/data/my-questions.js`, un-comment the example and edit it, or paste a block at the END of `questions: [ ... ]`
in `js/data/bank/<course>.js`. Refresh the browser — no build step.

```js
UC_BANK.add("data-science", {
  topic: "python", level: "E",          // level: "E" easy | "M" medium | "H" hard
  q: "What is the difference between a list and a tuple?",
  a: "Lists are mutable, tuples are immutable.",
  companies: ["tcs"], packages: ["3-4-lpa"],   // optional
});
```
Topic slugs are at the top of each `bank/<course>.js`; company / package slugs are in `bank/_meta.js`.
Note: the "111 questions" style numbers on the dashboard cards are typed text in `js/data/pages-dashboard.js`.

## Hot / Very Hot tags and company / LPA tags
- **All questions**: Hot / Very Hot tag, first 3 companies (logo), first 2 salary bands (LPA), difficulty.
- **Company page** (e.g. TCS): only that company's logo + the salary bands + difficulty.
- **Package page** (e.g. 8–10 LPA): only that LPA, then "Also asked at" the companies that asked the question.
- Hottest questions are listed first on every list; each list shows "N Very Hot / N Hot" on top, and the company /
  package hub cards show how many Very Hot questions they have.
- Automatic rule (`js/question-bank.js`): score = companies + 2 × salary bands a question is tagged with; the top 12% of a
  course = Very Hot, next 22% = Hot (`HEAT_VERY`, `HEAT_HOT`). The company/band tags in the bank are the only signal, so
  mark the questions you KNOW are asked most by hand: add `heat: "very"`, `heat: "hot"` or `heat: "none"` to a question
  in `js/data/bank/<course>.js` or `my-questions.js`.

## Last-Minute Revision and 7-Day Job Prep (visitors, on the website)
- Every question in the interview-questions lists has a **Save to ▾** button → *Last-Minute Revision* or *7-Day Job Prep*.
- Those two pages show ONLY the questions the visitor saved. Nothing saved → "No questions added yet".
- Each saved question has a **Remove** button (and there is **Remove all**). Clicking Save again on a saved question also removes it.
- Guests can add **5** questions per page. After sign up / log in: **20** (Last-Minute) and **100** (7-Day).
  Change these at the top of `js/saved.js` (`GUEST_MAX`, `MAX`).

## Sign-up wall on long lists
- On the "all questions", company-wise and package-wise lists, guests see the first **20** questions.
  From #21 the questions are blurred and a "Sign up or log in" card appears. Logged-in users see everything.
- Change the 20 in `js/question-bank.js` (`var FREE = 20`).

## Important
Login in this project is a front-end demo (stored in the browser's localStorage). The blur is visual, so someone
technical can still read the questions in the page source. For real protection the questions and accounts must come
from a server.
