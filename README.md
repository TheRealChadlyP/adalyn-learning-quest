# Adalyn’s Learning Quest

A Sunday–Saturday school assignment planner with illustrations, saved checkmarks, day planning, completion stars, and collapsible completed cards.

## Publish once

In Settings → Pages, choose Deploy from a branch, main, and / (root), then Save. GitHub publishes updates to main automatically.

## Weekly updates

The site entry is index.html. Each week has a separate weeks/YYYY-MM-DD.html page. weeks.json supplies the week picker. Keep weekStart, local-storage keys, and assignment IDs unchanged during same-week updates. Append new weeks to the registry and show the latest week on index.html. School links still require the student's school authentication.

## Progress

Progress stays in the current browser, separate for each week, and does not sync between devices. The Grown-up corner exports and restores progress. Download a backup from the old local HTML page and restore it on the website for a one-time move.

## Source

source/ holds the weekly template and spreadsheet extraction script. New releases should include the website week selector and web-specific update instructions. Do not upload credentials or browser progress files to this repository.

## Unfinished assignments from earlier weeks

Every weekly page and the weekly template load assets/unfinished.js and assets/unfinished.css. The expandable backpack tile reads weeks.json and source/weekly-tasks-YYYY-MM-DD.json for earlier published weeks, then reads their existing local browser checkmarks. Always publish the matching source JSON when adding a week. This list does not copy, reschedule, or count earlier assignments in the current week's progress. It links to the original card with ?mission=ASSIGNMENT_ID.

Earlier means before the later of the displayed week and the browser's current Sunday-start week. Thus the newest published page can list its own unfinished assignments when the calendar has moved on and the next page has not been published yet. The list updates on returning to the page and after checklist changes. No progress is uploaded; the list only knows this browser's checkmarks. Failed week loads are identified rather than reported as all complete.
