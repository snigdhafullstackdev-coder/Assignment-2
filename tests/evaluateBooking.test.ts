import { evaluateBooking } from "../src/evaluateBooking";
import { Booking } from "../src/types";

function b(partial: Partial<Booking>): Booking {
  return {
    id: partial.id ?? "x",
    roomId: partial.roomId ?? "R1",
    title: partial.title ?? "",
    start: partial.start!,
    end: partial.end!,
    priority: partial.priority ?? 1
  };
}

describe("evaluateBooking", () => {

  test("No overlap → fully accepted", () => {
    const existing = [
      b({
        id: "A",
        start: "2025-01-01T10:00:00Z",
        end: "2025-01-01T11:00:00Z",
        priority: 1
      })
    ];

    const candidate = b({
      id: "C",
      start: "2025-01-01T11:00:00Z",
      end: "2025-01-01T12:00:00Z",
      priority: 2
    });

    const result = evaluateBooking(existing, candidate);

    expect(result.conflicts.length).toBe(0);
    expect(result.accepted.length).toBe(1);
  });

  test("Partial overlap - candidate lower priority → overlap removed", () => {
    const existing = [
      b({
        id: "A",
        start: "2025-01-01T10:00:00Z",
        end: "2025-01-01T11:00:00Z",
        priority: 5
      })
    ];

    const candidate = b({
      id: "C",
      start: "2025-01-01T10:30:00Z",
      end: "2025-01-01T11:30:00Z",
      priority: 1
    });

    const result = evaluateBooking(existing, candidate);

    expect(result.accepted.length).toBe(1);
    expect(result.accepted[0].start).toBe("2025-01-01T11:00:00.000Z");
    expect(result.accepted[0].end).toBe("2025-01-01T11:30:00.000Z");
  });

  test("Full overlap - candidate lower priority → fully rejected", () => {
    const existing = [
      b({
        id: "A",
        start: "2025-01-01T10:00:00Z",
        end: "2025-01-01T12:00:00Z",
        priority: 3
      })
    ];

    const candidate = b({
      id: "C",
      start: "2025-01-01T10:30:00Z",
      end: "2025-01-01T11:30:00Z",
      priority: 2
    });

    const result = evaluateBooking(existing, candidate);

    expect(result.accepted.length).toBe(0);
  });

  test("Full overlap - candidate higher priority → fully accepted", () => {
    const existing = [
      b({
        id: "A",
        start: "2025-01-01T10:00:00Z",
        end: "2025-01-01T12:00:00Z",
        priority: 1
      })
    ];

    const candidate = b({
      id: "C",
      start: "2025-01-01T10:30:00Z",
      end: "2025-01-01T11:30:00Z",
      priority: 5
    });

    const result = evaluateBooking(existing, candidate);

    expect(result.accepted.length).toBe(1);
  });

  test("Two overlaps → candidate split", () => {
    const existing = [
      b({
        id: "A",
        start: "2025-01-01T10:00:00Z",
        end: "2025-01-01T10:30:00Z",
        priority: 5
      }),
      b({
        id: "B",
        start: "2025-01-01T11:00:00Z",
        end: "2025-01-01T11:30:00Z",
        priority: 5
      })
    ];

    const candidate = b({
      id: "C",
      start: "2025-01-01T09:45:00Z",
      end: "2025-01-01T11:45:00Z",
      priority: 1
    });

    const result = evaluateBooking(existing, candidate);

    expect(result.accepted.length).toBe(3);
  });

  test("Edge adjacency → no overlap", () => {
    const existing = [
      b({
        id: "A",
        start: "2025-01-01T10:00:00Z",
        end: "2025-01-01T11:00:00Z",
        priority: 1
      })
    ];

    const candidate = b({
      id: "C",
      start: "2025-01-01T11:00:00Z",
      end: "2025-01-01T12:00:00Z",
      priority: 1
    });

    const result = evaluateBooking(existing, candidate);

    expect(result.accepted.length).toBe(1);
  });
});

