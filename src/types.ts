export interface Booking {
  id: string;
  roomId: string;
  title: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  priority: number;
}

export interface ConflictInfo {
  existingId: string;
  overlapStart: string;
  overlapEnd: string;
}

export interface BookingDecision {
  conflicts: ConflictInfo[];
  accepted: Booking[];
}
