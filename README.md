# Psikotest Online App

[Indonesian](#bahasa-indonesian) | [English](#english)

---

<a name="bahasa-indonesian"></a>
## 🇮🇩 Bahasa Indonesia

**Psikotest Online** adalah platform berbasis web untuk menyelenggarakan tes psikologi secara digital. Aplikasi ini dirancang untuk memudahkan HRD atau instansi dalam memberikan tes kepada peserta dengan hasil yang dapat dipantau secara real-time.

### ✨ Fitur Utama
- **Modul Tes**:
  - **Papi Kostick**: Tes kepribadian untuk menilai kecenderungan perilaku di tempat kerja.
  - **Kraepelin (Pauli)**: Tes kecepatan, ketelitian, dan ketahanan kerja menggunakan deret angka.
- **Admin Dashboard**: Manajemen token, pemantauan peserta, dan pengaturan tes.
- **Sistem Token**: Akses aman bagi peserta menggunakan token sekali pakai atau sesuai durasi.
- **Real-time Monitoring**: Pantau progress pengerjaan peserta langsung dari dashboard.

### 🛠️ Teknologi (Tech Stack)
- **Framework Backend**: Laravel 12 (Modern & Secure PHP Framework)
- **Frontend**: React 19 dengan Inertia.js (Single Page Application feel)
- **Styling**: Tailwind CSS 4 dengan Shadcn/UI (Modern & Responsive design)
- **Database**: MySQL/MariaDB atau SQLite.
- **Tools**: Vite, Lucide Icons, Radix UI.

### 🚀 Cara Instalasi (Lokal)
1. **Clone Repository**:
   ```bash
   git clone https://github.com/username/psikotest-app.git
   cd psikotest-app
   ```
2. **Instal Dependensi Backend**:
   ```bash
   composer install
   ```
3. **Instal Dependensi Frontend**:
   ```bash
   npm install
   ```
4. **Environment Setup**:
   Copy file `.env.example` ke `.env` dan sesuaikan pengaturan database Anda.
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
5. **Database Migration & Seeder**:
   ```bash
   php artisan migrate --seed
   ```
6. **Jalankan Aplikasi**:
   Gunakan perintah berikut untuk menjalankan server dan build frontend:
   ```bash
   npm run dev
   ```

---

<a name="english"></a>
## 🇺🇸 English

**Psikotest Online** is a web-based platform for organizing digital psychological tests. This application is designed to facilitate HR departments or institutions in providing tests to participants with results that can be monitored in real-time.

### ✨ Key Features
- **Test Modules**:
  - **Papi Kostick**: A personality test to assess behavioral tendencies in the workplace.
  - **Kraepelin (Pauli)**: A test of speed, accuracy, and endurance using number series.
- **Admin Dashboard**: Token management, participant monitoring, and test settings.
- **Token System**: Secure access for participants using one-time or duration-based tokens.
- **Real-time Monitoring**: Monitor participant progress directly from the dashboard.

### 🛠️ Tech Stack
- **Backend Framework**: Laravel 12
- **Frontend**: React 19 with Inertia.js
- **Styling**: Tailwind CSS 4 with Shadcn/UI
- **Database**: MySQL/MariaDB or SQLite
- **Tools**: Vite, Lucide Icons, Radix UI

### 🚀 Local Installation
1. **Clone Repository**:
   ```bash
   git clone https://github.com/username/psikotest-app.git
   cd psikotest-app
   ```
2. **Install Backend Dependencies**:
   ```bash
   composer install
   ```
3. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```
4. **Environment Setup**:
   Copy `.env.example` to `.env` and adjust your database settings.
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
5. **Database Migration & Seeder**:
   ```bash
   php artisan migrate --seed
   ```
6. **Run Application**:
   Use the following command to run the server and build the frontend:
   ```bash
   npm run dev
   ```

---

## 📝 License
Proyek ini dilisensikan di bawah lisensi MIT.
