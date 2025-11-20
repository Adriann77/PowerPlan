# PowerPlan backend

## Quick Start Guide

## Required Tools and Versions

- **C#**: Version 10 or higher
- **.NET SDK**: **Minimum required version: 8.0.416**
- No other tools or dependencies need to be installed.
---

1. **No additional downloads are required** — all necessary dependencies are already included in the project.
3. Build the project:
   ```bash
   dotnet build
   ```
4. Create a file named `appsettings.Development.json` in the project root.
5. Copy the contents of the `appsettings.json` file and paste them into the newly created `appsettings.Development.json` with filling credentials. 
6. Run the server in development mode:
   ```bash
   dotnet watch
   ```

---

## Database Migrations and Seeding

No migrations are required because the database is hosted in the cloud and is already fully set up.

Database seeding is also not required.