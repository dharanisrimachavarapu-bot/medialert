# Medicine Expiry Alert System

This is a complete Android mobile application developed in Java using Android Studio that helps users track their medicines and alerts them regarding their expiry dates. 

## 🔹 Features Included
- **Login & Registration**: Secure local authentication using SQLite.
- **Dashboard Screen**: Displays total medicines, safe medicines, near expiry medicines (≤ 7 days), and expired medicines (< 0 days) using beautiful UI Cards.
- **Add Medicine**: Includes a `DatePickerDialog` to easily select expiry dates.
- **Medicine List**: A `RecyclerView` displaying all entries with custom styling denoting their status. Users can conveniently delete records.
- **Expiry Logic**: Automatically calculates the remaining days and updates the status badge to Safe (Green), Near Expiry (Orange), or Expired (Red).
- **Architecture**: Employs clean Activity separations, robust SQLite DB interactions, and smooth modern UI layouts.

---

## 🔹 Step-by-step Explanation

### 1. Database Configuration (`DatabaseHelper.java`)
We utilized Android's `SQLiteOpenHelper` to handle data persistence on the local device. The helper class creates two core tables:
- `users`: Stores user credentials (`username` and `password`).
- `medicines`: Stores medicine details linked to users (`id`, `userId`, `name`, `expiryDate`).
It provides convenient methods to save, retrieve, check credentials, and delete distinct entries.

### 2. UI Layouts / XML Files (`res/layout/`)
- `colors.xml`: Defines our healthcare-inspired color palette (Blue, Green, White) along with alert variants.
- `activity_splash.xml`: Shows a centered icon and app name, serving as the Splash logic UI.
- `activity_login.xml` / `activity_register.xml`: Simplified forms for authentication logic.
- `activity_dashboard.xml`: Uses Android's `CardView` to show beautifully styled statistic blocks (Total, Expired, Near Expiry, Safe).
- `activity_add_medicine.xml`: Contains form inputs structured vertically. Expiry text is clickable and opens a Calendar picker.
- `activity_medicine_list.xml` & `item_medicine.xml`: Forms the RecyclerView and the individual item layout holding a delete icon, name, expiry date, and dynamically colored status badge.

### 3. Core Logic (`Activities`)
- **SplashActivity.java**: Runs a 2-second delay on the `MainLooper`. Checks `SharedPreferences` if the user is already logged in, seamlessly skipping login logic if authenticated.
- **LoginActivity & RegisterActivity.java**: Collect input texts, validate against the `DatabaseHelper`, and handle toasts/redirection based on SQL triggers. Stores User ID globally in `MedPrefs`.
- **DashboardActivity.java**: The hub. In `onResume()`, it calls the database for medicines matching the active `userId`. It dynamically runs date math (`TimeUnit.DAYS.convert`) to categorize items into Safe / Near Expiry / Expired correctly and feeds the UI Views.
- **AddMedicineActivity.java**: Inits a `DatePickerDialog` avoiding raw String input. Formats dates securely and writes directly to the `medicines` table.
- **MedicineListActivity & MedicineAdapter.java**: Attaches the SQLite query onto an Android `RecyclerView`. The `Adapter` iterates through every `Medicine` model, re-calculates the Expiry metrics, and dynamically shifts colors on the UI. Additionally handles the custom deletion alert dialog upon pressing the Trash bin.

### 4. Manifest File (`AndroidManifest.xml`)
We configured `SplashActivity` as our main launcher intent. Defined an overarching light theme devoid of raw actionbars, opting instead for programmatic toolbars integrated into our modern layout schemas.

---

## 🔹 How to run the app
1. Open this folder in **Android Studio**. It will be recognized as an Android source directory.
2. Re-sync your Gradle files if initialized as a new project, and compile.
3. Use the Android Emulator or connect a physical device to successfully build and test the app's components!
