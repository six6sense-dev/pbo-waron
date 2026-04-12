# Test Credentials - Waron Hospital PBO System

## Development/Testing Credentials

Use these credentials to test different role features during local testing.

### Admin Account (Full Access)
- **Username**: `admin`
- **Password**: `admin123`
- **Name**: Administrator
- **Role**: admin
- **Permissions**: All (view_basic_calc, advanced_calc, manage_users, view_audit, etc.)
- **Access**: All tabs (Calculator, Reports, Audit, Users, Profile)
- **Use for**: System administration, user management, audit viewing

### Finance Account (Reports & Audit)
- **Username**: `finance1`
- **Password**: `finance123`
- **Name**: Siti Keuangan
- **Role**: finance
- **Permissions**: view_basic_calc, advanced_calc, view_audit, export_data
- **Access**: Calculator, Reports, Audit, Profile tabs
- **Use for**: Financial reporting, calculation verification, audit log review

### Doctor Account (Calculations Only)
- **Username**: `doctor1`
- **Password**: `doctor123`
- **Name**: Dr. Budi
- **Role**: doctor
- **Permissions**: view_basic_calc only
- **Access**: Calculator, Profile tabs only
- **Use for**: Patient billing calculations, basic diagnostic procedures

### Staff Account (Basic Access)
- **Username**: `staff1`
- **Password**: `staff123`
- **Name**: Rina Staf
- **Role**: staff
- **Permissions**: view_basic_calc, edit_self_profile
- **Access**: Calculator, Profile tabs only
- **Use for**: Reception staff, general calculator access

---

## Testing Scenarios

### Scenario 1: Login and Basic Calculation (All Roles)
1. Login with any credential above
2. Navigate to **Calculator** tab
3. Select: Procedure = "Appendectomy", Class = "KELAS III", Doctor = "Standard"
4. Click **Calculate**
5. ✅ Result should show with total amount

**Expected**: All roles can perform this action

---

### Scenario 2: Advanced Calculation (Admin, Finance Only)
1. Login as **admin** or **finance1**
2. Go to **Calculator** tab
3. Select: Procedure, Class, Doctor = "Specialist"
4. Click **Calculate** with advanced settings
5. ✅ Works fine

**Expected**: Doctor and Staff see error or limited options

---

### Scenario 3: View Audit Logs (Admin, Finance Only)
1. Login as **admin** or **finance1**
2. Click on **Audit** tab
3. ✅ Table shows all login/calculate events
4. Filter by action (login, calculate)
5. Filter by days (24h, 7d, 30d)

**Expected**: Doctor/Staff don't see this tab at all

---

### Scenario 4: Manage Users (Admin Only)
1. Login as **admin**
2. Click on **Users** tab
3. ✅ Form to create new users appears
4. Click on existing users to edit
5. Click X to delete user

**Expected**: Only admin sees this tab

---

### Scenario 5: Change Password (All Roles)
1. Login with any credential
2. Click on **Profile** tab
3. Enter current password
4. Enter new password twice
5. ✅ "Password updated successfully"

**Expected**: All roles can change their password

---

### Scenario 6: Logout and Session
1. Login successfully
2. Click **Logout** button
3. ✅ Redirected to login screen
4. Check browser localStorage (DevTools → Application → localStorage)
5. ✅ No `authToken` or `authUser` keys

**Expected**: Session cleared completely

---

### Scenario 7: Invalid Credentials
1. Go to login screen
2. Try: Username = "invalid", Password = "wrong"
3. Click **Login**
4. ✅ Error message appears: "User tidak ditemukan"

**Expected**: Error handling works

---

### Scenario 8: Session Timeout (Manual Test)
1. Login successfully
2. Open DevTools → Console
3. Paste: `localStorage.setItem('authToken', 'invalid.token.here')`
4. Refresh page
5. Try to use any feature
6. ✅ Should get 401 Unauthorized → Redirect to login

**Expected**: Invalid tokens are rejected

---

## Spreadsheet Data Requirements

For testing with real data, your spreadsheet should have:

### Users Sheet Example
```
Username    | Password | Name              | Role
------------|----------|-------------------|----------
admin       | admin123 | Administrator     | admin
finance1    | finance123 | Siti Keuangan    | finance
doctor1     | doctor123 | Dr. Budi          | doctor
staff1      | staff123  | Rina Staf         | staff
doctor2     | pass456   | Dr. Ani           | doctor
finance2    | pass789   | Bambang Accounting| finance
```

### Procedures Sheet Example
```
Tindakan            | TarifDasar | Kategori
--------------------|-----------|----------
Appendectomy        | 2500000   | Surgical
Cesarean Section    | 4000000   | OB/GYN
X-Ray Chest         | 350000    | Diagnostic
CT Scan Head        | 1500000   | Diagnostic
Blood Test          | 150000    | Lab
Ultrasound          | 500000    | Diagnostic
General Anesthesia  | 1000000   | Anesthesia
```

### Classes Sheet Example
```
KelasKamar  | Multiplier
------------|------------
KELAS I     | 1.5
KELAS II    | 1.2
KELAS III   | 1.0
```

---

## Fallback Mode

**If spreadsheet is not accessible** (service account not shared):
- System will use fallback credentials: `admin` / `admin123` (admin role only)
- Bootstrap data will be empty (no procedures/classes loaded)
- Ideal for testing authentication flow without spreadsheet setup

---

## Performance Testing Checklist

Use these credentials to test system under different loads:

- [ ] Login with 10 different accounts rapidly → Check for timeouts
- [ ] Calculate 50 times in succession → Check for rate limiting
- [ ] View audit logs after many operations → Check performance
- [ ] Switch between roles 5+ times → Check session handling
- [ ] Open DevTools Network tab → Check bundle sizes and API response times

**Expected**: All operations complete in < 2 seconds

---

## Security Testing Checklist

- [ ] Attempt SQL injection in login: `admin' OR '1'='1`
- [ ] Attempt XSS in username field: `<script>alert('xss')</script>`
- [ ] Try accessing /api/users without token → Should get 401
- [ ] Try accessing /api/audit as doctor → Should get 403 (forbidden)
- [ ] Inspect token JWT payload in DevTools console: `atob(localStorage.authToken.split('.')[1])`

**Expected**: All security measures in place

---

## Demo Script (5-Minute Overview)

1. **Show Login** (30 seconds)
   - Open app
   - Show error handling with wrong credentials
   - Login as admin

2. **Dashboard Overview** (1 minute)
   - Show metrics cards
   - Highlight role-based tabs
   - Show that Finance/Doctor/Staff see different options

3. **Test Calculator** (1 minute)
   - Select: Appendectomy, KELAS III, Specialist
   - Show result: Rp 3,200,000 (2.5M × 1.28 multiplier)
   - Explain multiplier calculation

4. **Audit Logs** (1.5 minutes)
   - Switch to admin
   - Go to Audit tab
   - Filter by action "login"
   - Show all login attempts recorded
   - Filter by days "24 hours"

5. **User Management** (1 minute)
   - Create new user: "nurse1", password, role=staff
   - Show user appears in table
   - Click edit, change name
   - Delete user with confirmation

6. **Wrap Up** (30 seconds)
   - Logout
   - Show session cleared
   - Mention 12-hour token expiration

**Total**: ~5 minutes, demonstrates all major features

---

## Support

If any credential doesn't work:
1. Check that `/api/login` accepts POST requests
2. Verify spreadsheet Users sheet exists and has required columns
3. Check browser console for error messages
4. Ensure .env.local has correct GOOGLE_SERVICE_ACCOUNT_EMAIL
5. Try fallback: `admin` / `admin123`

---

**Note**: These are test credentials for development. Use strong, unique production credentials!
