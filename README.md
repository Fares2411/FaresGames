# Game Database Website Project

## Overview

This project is a full-featured website for managing and exploring game-related data. The website was developed as part of a milestone for a course project and integrates a backend, frontend, database, and data scraping components.

* **Backend:** FastAPI with PyMySQL for database interaction.
* **Frontend:** React.js for a responsive, dynamic, and mobile-friendly interface.
* **Database:** MySQL hosted on [Aiven](https://aiven.io).
* **Deployment:**

  * Frontend: [Netlify](https://thunderous-dasik-8f57c9.netlify.app/)
  * Backend: [Render](https://render.com)

The website implements all milestone requirements on separate pages, with dynamic dropdowns, a navigation bar, and features that enhance user experience. While some pages may take a few seconds to load, this is due to the free-tier hosting limitations and multiple queries to fetch data—not inefficient queries.

---

## Features

* Fully responsive and mobile-friendly.
* Dynamic dropdowns with search functionality that always reflect the latest database entries.
* Navigation bar for easy movement between pages.
* Complete implementation of the “dream game” specifications.
* Backend API accessible via `/docs` for testing and exploration.
* Populated database with scraped and synthetic data.

---

## Database

The project uses a relational database with the following structure:

### Strong Entities

* **User:** EmailAddress (PK), UserName, Birthdate, Country, Password
* **Game:** GameID (PK), Title, Description, CoverPhoto, OverallCriticsCount, OverallCriticsScore, OverallMobyScore, OverallPlayersScore, OverallPlayersCount
* **Platform:** PlatformName (PK), Overview
* **Company:** CompanyID (PK), CompanyName, Country, Overview, Website
* **Person:** PersonID (PK), Name, Biography
* **MaturityRating:** Organization (PK), Description
* **Attribute:** Type (PK), Name (PK), Description

### Weak Entities

* **GamePlatform:** GameID (PK,FK), PlatformName (PK,FK), CriticsCount, CriticsScore, MobyScore, PlayersScore, PlayersCount
* **Release:** GameID (PK,FK), PlatformName (PK,FK), ReleaseDate (PK), DeveloperCompanyID (PK,FK), PublisherCompanyID (PK,FK)

### Many-to-Many Relationships & Multivalued Attributes

* **UserGamePlatform:** User_Email_Address (PK,FK), GameID (PK,FK), PlatformName (PK,FK), Rating
* **MaturityRating_GamePlatform:** MaturityRatingOrganization (PK,FK), GameID (PK,FK), PlatformName (PK,FK), Label, Reason
* **GamePersonCredits:** GameID (PK,FK), PersonID (PK,FK), Role (PK)
* **GameAttributes:** GameID (PK,FK), AttributeType (PK,FK), AttributeName (PK,FK) – used for gameplay, pacing, narrative, theme, perspective, visual style, interface, art style, setting, genre
* **GamePlatformAttributes_specs:** GameID (PK,FK), PlatformName (PK,FK), AttributeType (PK,FK), AttributeName (PK,FK) – used for BusinessModel, InputDevices, MediaType

### Database Files

* `Schema.sql` – Database schema.
* `MobyGamesDB_backup.sql` – SQL dump file.
* `populate.py` – Populates tables using scraped CSV data.
* `Users.py` – Populates Users table with fake data.

---

## Web Scraping

* Used **Playwright** and **Parsel**.
* `crawlers/` folder contains 14 scripts, each responsible for scraping a specific aspect of the website.
* `CSVs/` folder contains 13 CSV files storing scraped data.
* `populate.py` loads these CSVs into the database.

---

## Local Setup

### Backend

1. Navigate to the backend folder.
2. Activate virtual environment (if available):

   * Windows: `venv\Scripts\activate`
   * Mac/Linux: `source venv/bin/activate`
3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```
4. Run the backend server:

   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. Navigate to the frontend folder.
2. Install dependencies:

   ```bash
   npm install
   ```
3. Run the frontend server:

   ```bash
   npm run dev
   ```

### Access

* Website: [http://localhost:5173/](http://localhost:5173/)
* Backend API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

> **Note:** Update database credentials in `backend/app/config.py` before running locally.

---

## Live Demo

* [Deployed Website](https://thunderous-dasik-8f57c9.netlify.app/)

---

## Notes

* Some pages may take a few seconds to load due to free-tier hosting and multiple database queries.
* Overall, the website remains responsive, user-friendly, and fully functional.
* Additional features such as dynamic dropdowns and search functionality enhance the browsing experience.
