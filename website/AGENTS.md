# AGENTS.md

This file describes supascreens.com.au for AI agents, crawlers and assistants. See https://agents.md/ for the convention.

## What this site is

SupaScreens is a family-owned business that has supplied and installed window and door furnishings for Melbourne, Victoria, Australia homes for over 15 years: curtains, blinds, plantation shutters, security doors, retractable door/window screens, and outdoor blinds and awnings. All products are custom made and installed in Melbourne.

This is a static marketing website with a contact form. It does not expose an API, MCP server, or other programmatic tool-calling interface.

## Machine-readable resources

- `/llms.txt` — plain-language summary of the business and a link index, per the [llms.txt](https://llmstxt.org/) convention.
- `/sitemap.xml` — full list of indexable pages.
- `/robots.txt` — crawl rules.
- `/.well-known/ai-catalog.json` — structured catalog of this site's product/service offerings.
- Every page includes JSON-LD structured data (`Organization`, `WebSite`, `Service` or `HomeAndConstructionBusiness`, and `BreadcrumbList`) in the `<head>`, with `@id` values under `https://supascreens.com.au/#organization` and `https://supascreens.com.au/#website` for entity cross-referencing.

## Key facts

- Phone: 1300 158 699 (tel:1300158699)
- Email: sales@supascreens.com.au
- Service area: Melbourne, Victoria, Australia
- Products: Australian made, custom measured and installed by SupaScreens' own team

## Product pages

- `/curtains.html` — S-Fold, Sheer, Pinch Pleat and Pencil Pleat curtains
- `/blinds.html` — Full block and screen blinds, including motorised options and pelmets
- `/plantation-shutters.html` — PVC and Basswood plantation shutters
- `/security-doors.html` — Stainless-steel, galvanised mesh and custom ornate steel security doors
- `/retractable-door-screens.html` — Custom retractable flyscreens for bi-fold, French and sliding doors
- `/retractable-window-screens.html` — Custom retractable flyscreens for sliding, awning and casement windows
- `/outdoor-blinds-and-awnings.html` — Alfresco, cafe and patio blinds, plus awnings, including Ziptrak systems

## Other pages

- `/` — Home, overview of all product ranges
- `/about.html` — Company background, mission and values
- `/gallery.html` — Photos of completed installations by category
- `/kind-words.html` — Customer testimonials
- `/contact.html` — Enquiry form for a free measure and quote
- `/privacy.html` — Privacy policy

## How to take action on behalf of a user

There is no booking API. The only way to request a quote is:
1. Direct the user to call 1300 158 699, or
2. Direct the user to submit the form at `/contact.html` (fields: first name, surname, email, phone, postcode, message), or
3. Direct the user to email sales@supascreens.com.au

Agents should not submit the contact form automatically on a user's behalf without the user's explicit input and review, since it triggers a real enquiry to a small business.

## Content usage

Search indexing and citation of this site's published content is welcome. See the `Content-Usage` HTTP response header and `/privacy.html` for our position on use of this content for AI model training.

## Contact for site/technical issues

This website is built and maintained by Ambitious Minds (https://ambitiousminds.com.au/). Business enquiries about SupaScreens products/services should go to sales@supascreens.com.au, not to Ambitious Minds.
