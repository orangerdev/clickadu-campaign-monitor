# Campaign Monitor Sidebar

## Deskripsi

Sidebar ini memungkinkan Anda untuk mengisi data kampanye langsung ke spreadsheet Google Sheets yang aktif.

## Cara Menggunakan

1. **Membuka Sidebar:**

   - Setelah spreadsheet dibuka, akan muncul menu "Campaign Monitor" di menu bar
   - Klik menu "Campaign Monitor" → "Open Sidebar"
   - Sidebar akan muncul di sebelah kanan spreadsheet

2. **Mengisi Form:**

   - **Campaign ID**: Pilih kampanye dari dropdown yang berisi daftar dari sheet CAMPAIGN (format: "ID - Name")
   - **Quick Date Ranges**: Gunakan tombol-tombol preset untuk memilih rentang tanggal umum
   - **Start Date**: Pilih tanggal mulai (format YYYY-MM-DD akan otomatis)
   - **End Date**: Pilih tanggal berakhir (format YYYY-MM-DD akan otomatis)

3. **Submit Data:**
   - Klik tombol "Submit" untuk mengirim data
   - Sistem akan memvalidasi bahwa:
     - Kampanye telah dipilih dari dropdown
     - Semua field telah diisi
     - Tanggal berakhir tidak lebih awal dari tanggal mulai
   - Data akan otomatis diisi ke sheet yang aktif:
     - Cell A1: Campaign ID
     - Cell A2: Start Date (dengan format "YYYY-MM-DD 00:00:00")
     - Cell B2: End Date (dengan format "YYYY-MM-DD 23:59:59")

## Fitur Tambahan

- **Validasi Otomatis**: Form akan memvalidasi input sebelum submit
- **Status Feedback**: Menampilkan pesan sukses atau error setelah submit
- **Default Values**: Tanggal hari ini akan otomatis terisi di field tanggal
- **Responsive Design**: Interface yang modern dan mudah digunakan
- **Dynamic Campaign List**: Dropdown campaign diambil langsung dari sheet CAMPAIGN
- **Refresh Function**: Tombol refresh untuk memperbarui daftar campaign tanpa reload
- **Quick Date Ranges**: 8 preset tanggal untuk memudahkan pemilihan rentang waktu
- **Smart Date Calculation**: Otomatis menghitung rentang tanggal berdasarkan preset yang dipilih

## Struktur Data yang Dibutuhkan

### Sheet CAMPAIGN

Untuk dropdown Campaign ID bekerja dengan baik, pastikan sheet CAMPAIGN memiliki struktur:

- **Kolom A**: Campaign ID
- **Kolom B**: Campaign Name
- **Baris 1**: Header (opsional)
- **Baris 2 dst**: Data campaign

Contoh:

```
A1: ID    | B1: Name
A2: 12345 | B2: Campaign Test 1
A3: 67890 | B3: Campaign Test 2
```

Dropdown akan menampilkan format: "12345 - Campaign Test 1"

## Troubleshooting

Jika sidebar tidak muncul:

1. Refresh halaman spreadsheet
2. Pastikan script sudah di-deploy dengan benar
3. Cek apakah ada error di console log

Jika data tidak tersimpan:

1. Pastikan semua field telah diisi dengan benar
2. Pastikan format tanggal sesuai (YYYY-MM-DD)
3. Cek permission script untuk menulis ke spreadsheet
