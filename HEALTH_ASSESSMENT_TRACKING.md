# Health Assessment Tracking System

## Overview

The Health Assessment tool now tracks all health assessment calls in the database. This allows you to:
- Count the total number of health assessments per coach
- Track enrollment rates (when `call_outcome = 'enrolled'`)
- Analyze conversion rates
- Monitor coach performance

## Database Schema

### Table: `health_assessments`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `auth.users` (coach ID) |
| `client_name` | TEXT | Client's name (nullable) |
| `client_phone` | TEXT | Client's phone number (nullable) |
| `client_why` | TEXT | Client's motivation/"why" (nullable) |
| `client_commitment` | TEXT | Commitment level from form (nullable) |
| `call_outcome` | TEXT | One of: 'enrolled', 'followup', 'thinking', 'not-ready', 'not-fit' |
| `enrolled` | BOOLEAN | **Auto-generated**: `true` when `call_outcome = 'enrolled'` |
| `timer_seconds` | INTEGER | Call duration in seconds |
| `progress` | INTEGER | Checklist completion percentage (0-100) |
| `call_notes` | TEXT | Additional notes from the coach |
| `created_at` | TIMESTAMPTZ | Timestamp when the assessment was submitted |

### Indexes

- `idx_health_assessments_user_id` - Fast lookups by coach
- `idx_health_assessments_enrolled` - Fast filtering by enrollment status
- `idx_health_assessments_created_at` - Fast date-based queries
- `idx_health_assessments_user_enrolled` - Composite index for coach + enrollment queries

## Row Level Security (RLS)

- **Coaches** can only view their own health assessments
- **Coaches** can insert their own health assessments
- **Admins** can view all health assessments

## Example Queries

### Count Total Assessments by Coach

```sql
SELECT 
  p.full_name AS coach_name,
  p.email,
  COUNT(*) AS total_assessments
FROM health_assessments ha
JOIN profiles p ON p.id = ha.user_id
GROUP BY p.id, p.full_name, p.email
ORDER BY total_assessments DESC;
```

### Count Enrollments by Coach

```sql
SELECT 
  p.full_name AS coach_name,
  p.email,
  COUNT(*) AS total_enrollments
FROM health_assessments ha
JOIN profiles p ON p.id = ha.user_id
WHERE ha.enrolled = true
GROUP BY p.id, p.full_name, p.email
ORDER BY total_enrollments DESC;
```

### Calculate Conversion Rate by Coach

```sql
SELECT 
  p.full_name AS coach_name,
  COUNT(*) AS total_assessments,
  COUNT(*) FILTER (WHERE ha.enrolled = true) AS enrollments,
  ROUND(
    (COUNT(*) FILTER (WHERE ha.enrolled = true)::DECIMAL / COUNT(*)) * 100, 
    2
  ) AS conversion_rate_percent
FROM health_assessments ha
JOIN profiles p ON p.id = ha.user_id
GROUP BY p.id, p.full_name
HAVING COUNT(*) > 0
ORDER BY conversion_rate_percent DESC;
```

### Monthly Assessment Trends

```sql
SELECT 
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS total_assessments,
  COUNT(*) FILTER (WHERE enrolled = true) AS enrollments
FROM health_assessments
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### Coach Performance Summary

```sql
SELECT 
  p.full_name AS coach_name,
  p.email,
  COUNT(*) AS total_assessments,
  COUNT(*) FILTER (WHERE ha.enrolled = true) AS enrollments,
  COUNT(*) FILTER (WHERE ha.call_outcome = 'followup') AS followups,
  COUNT(*) FILTER (WHERE ha.call_outcome = 'thinking') AS thinking,
  COUNT(*) FILTER (WHERE ha.call_outcome = 'not-ready') AS not_ready,
  COUNT(*) FILTER (WHERE ha.call_outcome = 'not-fit') AS not_fit,
  ROUND(AVG(ha.timer_seconds) / 60, 2) AS avg_call_duration_minutes,
  ROUND(AVG(ha.progress), 2) AS avg_progress_percent
FROM health_assessments ha
JOIN profiles p ON p.id = ha.user_id
GROUP BY p.id, p.full_name, p.email
ORDER BY total_assessments DESC;
```

### Recent Assessments

```sql
SELECT 
  p.full_name AS coach_name,
  ha.client_name,
  ha.call_outcome,
  ha.enrolled,
  ha.created_at,
  ROUND(ha.timer_seconds / 60, 2) AS duration_minutes
FROM health_assessments ha
JOIN profiles p ON p.id = ha.user_id
ORDER BY ha.created_at DESC
LIMIT 50;
```

## Integration Points

### When Data is Saved

Data is automatically saved to the database when:
1. Coach clicks "Email Results" button in the Health Assessment tool
2. API route `/api/send-health-assessment-email` is called
3. Both email is sent AND database record is created

### Error Handling

- If database save fails, the email is still sent (data is logged for monitoring)
- The API response includes `savedToDatabase: true/false` to indicate success
- Frontend displays confirmation message about database save status

## Future Enhancements

Potential additions:
- Dashboard widget showing assessment stats
- Admin reports page for assessment analytics
- Coach-specific metrics on their profile/dashboard
- Export functionality for CSV/Excel reports
- Date range filtering
- Client relationship tracking (if same client multiple times)

## Migration

Run migration file: `supabase/migrations/017_health_assessments.sql`

This creates:
- The `health_assessments` table
- All necessary indexes
- RLS policies for security
- Database comments for documentation
