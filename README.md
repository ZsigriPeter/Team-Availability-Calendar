# Team-Availability-Calendar
A web application that allows teams to track and manage their availability for meetings, shifts, or collaborative work. It provides an intuitive interface where team members can indicate their available time slots, view team-wide availability, and suggest meeting times based on shared free slots.

Key Features:
1. User Authentication & Profiles
Sign up/login with Django authentication.

User profiles with names, roles, and working hours.

2. Availability Scheduling
Users can set their available hours for each day of the week.

Options for marking time slots as Busy, Available, or Preferred.

Recurring availability (e.g., "I’m always free on Tuesdays from 10-12 AM").

Ability to override specific dates (e.g., "I'm on vacation next Friday").

3. Team Calendar View
Displays a consolidated view of all team members’ availability.

Color-coded slots: Green (available), Yellow (preferred), Red (busy).

Search and filter by team members or departments.

4. Smart Meeting Suggestions
The system suggests optimal meeting times based on team members’ availability.

Options to set meeting duration (e.g., "Find a 1-hour slot with at least 3 members").

Sends invitations to confirm proposed meeting slots.

5. Notifications & Reminders
Email or in-app notifications for meeting requests.

Reminders before meetings.

Alerts when a meeting slot is modified or canceled.

6. Integration with External Calendars
Sync availability with Google Calendar, Outlook, or Apple Calendar.

Two-way syncing: updates in the app reflect in external calendars and vice versa.

7. Admin & Role Management
Admins can manage team members, approve schedule changes, and set meeting policies.

Different roles: Member (sets availability), Manager (suggests meetings), Admin (manages settings).

8. Responsive UI with TypeScript & React
Calendar grid interface with drag-and-drop to adjust availability.

Dark mode support.

Mobile-friendly design.

9. PostgreSQL Database Structure
Users Table: Stores user details and roles.

Availability Table: Tracks each user's available slots.

Meetings Table: Stores scheduled meetings with participants.

10. Future Enhancements (Stretch Goals)
AI-based availability prediction (suggest times based on past behavior).

Time zone adjustments for remote teams.

Public sharing links for external scheduling.

Tech Stack
Backend: Django + Django REST Framework (API)

Frontend: React + TypeScript

Database: PostgreSQL

Authentication: Django Auth + JWT

Calendar Integration: Google Calendar API, Outlook API

Deployment: Docker + AWS/GCP/Vercel
