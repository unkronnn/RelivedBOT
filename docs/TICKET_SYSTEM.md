# 🎫 Ticket System Documentation

## Overview
Sistem ticket menggunakan private threads dengan 6 kategori berbeda:
- 💰 Donate
- 👤 Report Player
- 🐛 Report Bug
- 👮 Report Staff
- 📖 Character Story (CS)
- 💀 Character Killed (CK)

## Setup

### 1. Konfigurasi Channel IDs
Tambahkan channel IDs di file `.env`:

```env
CHANNEL_DONATE_ID=1234567890123456789
CHANNEL_REP_PLAYER_ID=1234567890123456789
CHANNEL_BUG_ID=1234567890123456789
CHANNEL_REP_STAFF_ID=1234567890123456789
CHANNEL_CS_ID=1234567890123456789
CHANNEL_CK_ID=1234567890123456789
```

### 2. Deploy Commands
```bash
npm run deploy
```

### 3. Send Ticket Panel
Gunakan command `/ticket-panel` di channel yang diinginkan untuk menampilkan tombol ticket.

## User Workflow

### Membuat Ticket
1. User klik salah satu tombol kategori (Donate, Report Player, dll.)
2. Modal muncul dengan form input sesuai kategori
3. User mengisi form dan submit
4. Bot membuat private thread baru di channel yang sesuai
5. Bot menambahkan user ke thread
6. Bot mengirim embed ticket dengan tombol **Claim** dan **Close**

### Staff Workflow

#### Claim Ticket
1. Staff melihat ticket baru
2. Staff klik tombol **Claim Ticket**
3. Bot menambahkan field "Handled by" ke embed
4. Tombol Claim disabled
5. Bot mengirim pesan "Ticket claimed by @Staff"

#### Close Ticket
**Opsi 1: Direct Close**
1. Staff/User klik tombol **Close Ticket**
2. Bot mengirim pesan konfirmasi penutupan
3. Thread di-archive dan di-lock

**Opsi 2: Request Close (dengan konfirmasi)**
1. Staff menggunakan command `/close-request`
   - `reason`: Alasan penutupan
   - `deadline`: Deadline untuk response (e.g., "24 jam")
2. Bot mengirim embed dengan tombol **Accept** dan **Deny**
3. User/Staff lain klik salah satu:
   - **Accept**: Thread ditutup setelah 3 detik
   - **Deny**: Ticket tetap terbuka, tombol disabled

## Ticket Categories

### 💰 Donate
**Form Fields:**
- Nama UCP
- Nama Ingame
- Ingin Donate Apa

**Target Channel:** `CHANNEL_DONATE_ID`

### 👤 Report Player
**Form Fields:**
- Nama Player Pelaku
- Alasan / Kronologi

**Target Channel:** `CHANNEL_REP_PLAYER_ID`

### 🐛 Report Bug
**Form Fields:**
- Detail Bug
- Link Bukti (opsional)

**Target Channel:** `CHANNEL_BUG_ID`

### 👮 Report Staff
**Form Fields:**
- Nama Staff
- Issue / Masalah
- Link Bukti (opsional)

**Target Channel:** `CHANNEL_REP_STAFF_ID`

### 📖 Character Story (CS)
**Form Fields:**
- Nama UCP
- Nama IC Lama
- Nama IC Baru

**Target Channel:** `CHANNEL_CS_ID`

### 💀 Character Killed (CK)
**Form Fields:**
- Nama UCP
- Nama IC Lama (Yang di-CK)
- Nama IC Baru (Request)

**Target Channel:** `CHANNEL_CK_ID`

## Commands

### `/ticket-panel`
**Permission:** Administrator
**Description:** Menampilkan panel ticket dengan semua tombol kategori

**Usage:**
```
/ticket-panel
```

### `/close-request`
**Permission:** Anyone in ticket thread
**Description:** Request penutupan ticket dengan konfirmasi

**Usage:**
```
/close-request reason: "Masalah sudah selesai" deadline: "24 jam"
```

## Technical Details

### Thread Naming Convention
```
[CATEGORY_CODE] - [USERNAME]
```

Examples:
- `DONATE - JohnDoe`
- `REP-PLAYER - JaneSmith`
- `BUG - PlayerName`

### Embed Colors
- 💰 Donate: Green (`0x57F287`)
- 👤 Report Player: Red (`0xED4245`)
- 🐛 Report Bug: Yellow (`0xFEE75C`)
- 👮 Report Staff: Red (`0xED4245`)
- 📖 CS: Blue (`0x5865F2`)
- 💀 CK: Pink (`0xEB459E`)

### Button IDs
- Category buttons: `ticket_{category}`
- Claim button: `ticket_claim:{thread_id}`
- Close button: `ticket_close:{thread_id}`
- Accept close: `close_accept:{requester_id}`
- Deny close: `close_deny:{requester_id}`

## Files Structure

```
src/
├── commands/
│   └── server/
│       ├── ticket-panel.ts      # Send ticket panel
│       └── close-request.ts     # Request ticket closure
├── handlers/
│   ├── buttons/
│   │   └── ticket_buttons.ts    # Handle all ticket buttons
│   └── modals/
│       └── ticket_modals.ts     # Handle ticket form submissions
```

## Troubleshooting

### "Target channel tidak ditemukan"
- Pastikan channel IDs di `.env` sudah benar
- Pastikan bot memiliki akses ke channel tersebut

### "Command ini hanya bisa digunakan di dalam ticket thread"
- `/close-request` hanya bisa digunakan di dalam thread ticket
- Pastikan Anda berada di thread yang dibuat oleh sistem ticket

### Thread tidak muncul
- Pastikan bot memiliki permission:
  - `MANAGE_THREADS`
  - `CREATE_PRIVATE_THREADS`
  - `SEND_MESSAGES_IN_THREADS`

### User tidak bisa melihat thread
- Private threads otomatis menambahkan user yang membuat ticket
- Staff perlu join thread manual atau bot bisa auto-add berdasarkan role

## Future Enhancements
- [ ] Auto-add staff role ke thread
- [ ] Ticket statistics/analytics
- [ ] Archive old tickets to database
- [ ] Search tickets by user/category
- [ ] Ticket rating system
- [ ] Auto-close inactive tickets
- [ ] Transcript generation
- [ ] Multiple staff assignment
