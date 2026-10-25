# UnCodemy Learn – project structure

index.html            -> only the page shell (head, #app, modal, toast, script order)
css/base.css          -> variables, reset, header, cards, sidebar, tables (shared by all pages)
css/home.css          -> home page only: hero + course cards
css/logos.css         -> company logo styles (interview pages)
css/updates.css       -> later overrides: back buttons, auth buttons, batches grid, pagination, responsive
css/saved.css         -> saved-questions pages + blurred sign-up wall
css/tags.css          -> Hot / Very Hot tags, company + LPA chips
js/data/layout.js     -> header (UC_H), course sidebars (UC_SB), footer (UC_FOOT)
js/data/pages-*.js    -> content of each page type (home, dashboard, roadmap, offers, ...)
js/data/bank/*.js     -> QUESTION BANK, one file per course (readable format) + _meta.js (companies, packages)
js/data/my-questions.js -> quickest place to add new questions
js/bank-build.js      -> converts the bank for the page generators
js/saved.js           -> "Save to" lists, Last-Minute Revision + 7-Day pages, guest limits (5 questions)
question-index/*.txt  -> list of question ids per course
HOW-TO-ADD.md         -> read this first
js/data/csv.js        -> downloadable CSV sheets
js/interactions.js    -> progress, reminders, coupons, checkout modal
js/hero.js            -> home hero animation
js/logo-fallback.js   -> company logo image fallback
js/question-bank.js   -> question data + pagination + login/signup + page generator
js/router.js          -> hash router (keep LAST)

Open index.html directly in browser, or run:  python3 -m http.server
