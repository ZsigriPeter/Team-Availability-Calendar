export interface UserEvent {
    id: number;
    type: 'solo' | 'group';
    description: string;
    date: string; // ISO format, e.g., "2025-04-15"
    start_time: string; // e.g., "14:00:00"
    end_time: string;   // e.g., "15:00:00"
    location?: string;  // optional if blank
    user: number | null;
    group: number | null;
    created_at: string; // ISO datetime string
    updated_at: string; // ISO datetime string
    google_event_id?: string; // ✅ Add this line
  }
  
export interface Group {
    id: number;
    name: string;
    owner: number;
    created_at: string;
    member_count: number;
  }

export interface TimeSlot {
    date: string;
    hour_start: string;
    hour_end: string;
  }