# ClassMate Website Improvement Suggestions

Website reviewed: https://aaravg13.pythonanywhere.com/

The site is live over HTTPS and titled **ClassMate**. The recommendations below focus on improving its purpose, usability, visual consistency, accessibility, performance, and security.

## Highest-Impact Improvements

### 1. Make the Purpose Obvious Immediately

The first screen should explain the website in one sentence:

> **ClassMate**  
> Plan homework, track deadlines, and study smarter—all in one place.

Add two clear buttons:

- **Get Started**
- **View Demo**

Underneath, show three benefits:

- Never miss an assignment
- Organise work by subject
- Track your weekly progress

A visitor should understand what ClassMate does before creating an account.

### 2. Build a Useful Student Dashboard

The dashboard should focus on what the student needs **today**, rather than displaying every feature at once.

A good structure would be:

```text
Good morning, Aarav

[ 3 tasks due today ] [ 2 upcoming tests ] [ 70% weekly progress ]

TODAY
• Finish science worksheet       Due 4:00 PM
• Revise French vocabulary       Due tomorrow

UPCOMING
• Mathematics test               Friday
• History presentation           Monday

[ + Add Assignment ]
```

Add subject colours, deadline indicators, and simple filters such as:

- **Today**
- **This Week**
- **Completed**
- **Overdue**

### 3. Simplify Navigation

Use no more than five main navigation items:

```text
Dashboard | Tasks | Calendar | Subjects | Profile
```

On mobile, turn these into a bottom navigation bar or hamburger menu.

Keep the main action, such as **Add Task**, visually different from ordinary links.

### 4. Improve Visual Consistency

Create a small design system instead of styling each page separately:

- One primary brand colour
- One accent colour
- Two font weights
- Consistent rounded corners
- Consistent button height
- An 8-pixel spacing system
- Maximum content width of around 1,100–1,200 pixels

Use cards only for important grouped information. Too many cards, shadows, and colours can make an educational dashboard feel crowded.

### 5. Add Proper Feedback States

Every action should clearly show what happened:

- Change buttons to **Saving…** while data is being saved
- Show a success message after adding a task
- Ask for confirmation before deleting something
- Show helpful errors beside the affected field
- Display an empty-state message when there are no assignments
- Use loading skeletons instead of blank pages

For example, replace a technical error such as `Error 500` with:

> We could not save your assignment. Your information has not been lost. Please try again.

### 6. Make It Work Properly on Phones

Test the site at widths such as:

- 320 px
- 375 px
- 768 px
- 1,024 px

Forms should use large inputs, buttons should be easy to tap, and tables should turn into cards or scroll horizontally instead of overflowing.

Responsive design should keep the interface usable across different screen sizes, and mobile forms should minimise unnecessary typing.

Reference: [MDN Mobile Accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Mobile)

### 7. Improve Accessibility

Make sure:

- Every input has a visible label
- Buttons clearly describe their action
- Text has sufficient colour contrast
- Images have useful alternative text
- The entire site works using the Tab key
- Focused links and buttons have a visible outline
- Colour is not the only way overdue work is identified

Semantic HTML should be used for controls, forms, navigation, headings, and page structure.

Reference: [W3C Focus Visible Guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)

### 8. Improve Loading Speed

Improve performance by:

- Compressing images
- Avoiding unnecessarily large libraries
- Deferring non-essential JavaScript
- Caching static CSS, JavaScript, and image files
- Removing unused CSS and JavaScript

Good Core Web Vitals targets are:

- **Largest Contentful Paint (LCP):** 2.5 seconds or less
- **Interaction to Next Paint (INP):** 200 milliseconds or less
- **Cumulative Layout Shift (CLS):** 0.1 or less

For a dashboard, pay particular attention to JavaScript connected to buttons, filters, and calendars.

References:

- [Web Vitals](https://web.dev/articles/vitals)
- [Optimise INP](https://web.dev/articles/optimize-inp)

### 9. Strengthen Account Security

Because ClassMate may store student information, make sure it has:

- Proper password hashing instead of plain-text password storage
- CSRF protection on forms that change information
- `HttpOnly`, `Secure`, and suitable `SameSite` cookie settings
- Login rate limiting
- Server-side permission checks
- Security response headers
- No passwords or private information inside URLs
- A clear logout option

Reference: [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

### 10. Add Professional Finishing Touches

Add:

- A recognisable ClassMate logo
- A favicon
- A useful page title for every route
- A short search-engine description
- Custom 404 and 500 pages
- Privacy and contact pages
- A footer containing the version or copyright year
- Demo data for first-time users
- A short guided onboarding process

Later, a custom domain would look more professional than a PythonAnywhere subdomain.

Reference: [PythonAnywhere Custom Domains](https://help.pythonanywhere.com/pages/CustomDomains/)

## Recommended Homepage Layout

```text
NAVBAR
ClassMate logo                  Features | About | Log in | Get Started

HERO
Organise school without the stress.
Track homework, deadlines, and study progress from one dashboard.

[ Get Started ]  [ View Demo ]

FEATURES
Smart task planning | Calendar view | Progress tracking

DASHBOARD PREVIEW
A screenshot or realistic interactive preview

HOW IT WORKS
1. Add your subjects
2. Enter assignments
3. Follow your daily plan

FOOTER
Privacy | Contact | About
```

## Recommended Implementation Order

1. Improve the homepage explanation.
2. Reorganise the dashboard around daily student needs.
3. Improve mobile responsiveness.
4. Improve accessibility.
5. Add loading, success, error, and empty states.
6. Strengthen account and data security.
7. Improve site performance.
8. Add branding, onboarding, and decorative polish.
9. Move to a custom domain when the main product is ready.

A clear and reliable ClassMate will feel better than a feature-heavy interface that is difficult to understand.
