# ProteinTrack — Protein Intake Tracker

A responsive, beginner-friendly web app for tracking daily protein intake. Built with HTML, CSS and vanilla JavaScript. Data is stored in the browser using `localStorage`; no backend or account is required.

## Features

- Profile with body weight and activity-level selection.
- Example daily protein target calculated as **body weight (kg) × 1.5 g/kg**, with an editable custom goal.
- Log food entries with quantity, unit and protein grams.
- Edit and delete entries.
- Built-in common-food database with quick-add buttons and search.
- Daily progress ring, consumed amount, remaining amount and percentage.
- Seven-day chart and selectable 7-, 14- or 30-day history.
- CSV export of food entries within the selected history range.
- Responsive layout for desktop and mobile.
- Saves data between refreshes using browser `localStorage`.

## Run locally

1. Download or clone this repository.
2. Open the folder in VS Code.
3. Open `index.html` in a browser, or use the VS Code **Live Server** extension and choose **Open with Live Server**.

There is no build step and no package installation.

## Data and calculation notes

The default target is a simple project rule: `body weight in kg × 1.5`. It is a configurable example used to demonstrate calculations, not medical advice or a personalised nutrition recommendation. The selected activity level is saved and displayed, but does not change the formula. A user can override the suggested target using the custom-goal field.

The common-food protein values are illustrative estimates intended for demo use. Actual protein depends on serving size, preparation and brand. For real-world tracking, verify values against product labels or a reliable nutrition database. No external nutrition API is used.

## Storage and privacy

Profile and food entries are stored in the current browser's local storage. They do not automatically sync to other browsers or devices. Clearing browser site data can remove saved entries. There is no login or cloud database in this version.

## Suggested manual test plan

1. Save a profile with a body weight and no custom goal; check the suggested target.
2. Enter a custom target and save it; confirm the dashboard updates.
3. Add a food with a quantity and protein amount; confirm the daily total and progress change.
4. Edit the food and then delete it; verify the total updates each time.
5. Refresh the page; confirm the profile and entries persist.
6. Change the history range and check the chart/table.
7. Export CSV and open the downloaded file.
8. Resize the browser to a mobile width and check the layout.

## Possible future enhancements

- Login and per-user cloud storage.
- Nutrition API integration.
- Calories, carbohydrates and fats.
- Reminders and streaks.
- Dark mode.

## Disclaimer

This is a learning and tracking tool. Its sample values and formula do not provide medical advice. Consult a qualified health professional for individual dietary guidance.
