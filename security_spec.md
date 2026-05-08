# Security Specification for BroGuardAI

## Data Invariants
1. A student record must have a unique NISN.
2. An assessment must be linked to a valid student ID.
3. Only authenticated Guru BK or Admin can create/update students.
4. Students can create assessments (self-report) for themselves.
5. Guru BK can create assessments for any student.
6. Only Guru BK/Admin can read all assessments; Students can only read their own if permitted (for now, we'll restrict it to Guru BK for safety).

## The Dirty Dozen Payloads

### 1. Identity Spoofing (Student)
Attempt to create a student record as a non-authenticated user.
```json
{
  "name": "Hacker",
  "nisn": "999999",
  "class": "X"
}
```
**Expected Result**: PERMISSION_DENIED

### 2. Identity Spoofing (Assessment)
Attempt to create an assessment as a student for another student's ID.
```json
{
  "studentId": "TARGET_STUDENT_ID",
  "responses": [],
  "timestamp": "2026-05-08T00:00:00Z"
}
```
**Expected Result**: PERMISSION_DENIED (Must match auth.uid if student)

### 3. Resource Poisoning (Long ID)
Attempt to use a massive string as a document ID.
**Expected Result**: PERMISSION_DENIED (via isValidId)

### 4. Shadow Field Injection
Attempt to inject a "verified" field into a student profile.
```json
{
  "name": "Budi",
  "verified": true
}
```
**Expected Result**: PERMISSION_DENIED (Strict schema)

### 5. State Shortcut (Risk Level)
Attempt to set an assessment's risk level to "low" manually when AI determined it was "critical".
```json
{
  "aiAnalysis": { "riskLevel": "low" }
}
```
**Expected Result**: PERMISSION_DENIED (Immutable after creation for students)

### 6. Orphaned Assessment
Create an assessment for a non-existent student.
**Expected Result**: PERMISSION_DENIED (exists() check)

### 7. Unauthorized Read (PII)
Authenticated student attempting to read all student records.
**Expected Result**: PERMISSION_DENIED

### 8. Unauthorized Management (Questions)
Student trying to delete a question.
**Expected Result**: PERMISSION_DENIED

### 9. Malicious Payload (Large Data)
Attempt to send a response with a 1MB string.
**Expected Result**: PERMISSION_DENIED (Size check)

### 10. Timestamp Spoofing
Client providing a past timestamp for `updatedAt`.
**Expected Result**: PERMISSION_DENIED (Must match request.time)

### 11. Role Escalation
User attempting to add themselves to an `admins` collection.
**Expected Result**: PERMISSION_DENIED

### 12. Blind Write (Update Gap)
Updating a student record without providing the required `class` field if the rule expects it.
**Expected Result**: PERMISSION_DENIED
