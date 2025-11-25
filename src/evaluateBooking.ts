import { Booking, BookingDecision, ConflictInfo } from "./types";

export function evaluateBooking(
  existing: Booking[],
  candidate: Booking
): BookingDecision {
  const sameRoom = existing.filter(b => b.roomId === candidate.roomId);

  // Normalize times
  const cStart = new Date(candidate.start).getTime();
  const cEnd = new Date(candidate.end).getTime();

  const conflicts: ConflictInfo[] = [];
  let allowedSegments = [{ start: cStart, end: cEnd }];

  for (const ex of sameRoom) {
    const exStart = new Date(ex.start).getTime();
    const exEnd = new Date(ex.end).getTime();

    const hasOverlap = cStart < exEnd && cEnd > exStart;
    if (!hasOverlap) continue;

    const overlapStart = Math.max(cStart, exStart);
    const overlapEnd = Math.min(cEnd, exEnd);

    conflicts.push({
      existingId: ex.id,
      overlapStart: new Date(overlapStart).toISOString(),
      overlapEnd: new Date(overlapEnd).toISOString()
    });

    // If candidate has lower/equal priority → that portion is removed
    if (candidate.priority <= ex.priority) {
      allowedSegments = allowedSegments.flatMap(seg => {
        // No relation
        if (seg.end <= overlapStart || seg.start >= overlapEnd) return [seg];

        const parts = [];
        if (seg.start < overlapStart) {
          parts.push({ start: seg.start, end: overlapStart });
        }
        if (seg.end > overlapEnd) {
          parts.push({ start: overlapEnd, end: seg.end });
        }
        return parts;
      });

    } else {
      // candidate has higher priority → it keeps the overlapped region
      // But segmentation rules don't require removal; we simply keep segments unchanged.
      // No action needed.
    }
  }

  // Merge adjacent segments
  allowedSegments.sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  for (const seg of allowedSegments) {
    if (!merged.length) {
      merged.push(seg);
    } else {
      const last = merged[merged.length - 1];
      if (last.end === seg.start) {
        last.end = seg.end;
      } else {
        merged.push(seg);
      }
    }
  }

  const accepted: Booking[] = merged.map((seg, i) => ({
    ...candidate,
    id: `${candidate.id}_part${i + 1}`,
    start: new Date(seg.start).toISOString(),
    end: new Date(seg.end).toISOString()
  }));

  return { conflicts, accepted };
}
