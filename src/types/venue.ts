import { DEFAULT_SEAT_STATUSES } from "@nex125/seatmap-core";
import type { Venue, Section, Row, Seat, PricingCategory } from "@nex125/seatmap-core";

const CATEGORIES: PricingCategory[] = [
    { id: "cat-vip", name: "VIP", color: "#e91e63" },
    { id: "cat-premium", name: "Premium", color: "#ff9800" },
    { id: "cat-standard", name: "Standard", color: "#4caf50" },
    { id: "cat-economy", name: "Economy", color: "#2196f3" },
    { id: "cat-upper", name: "Upper Deck", color: "#9c27b0" },
  ];
  
  export function generateVenue(targetSeatCount = 5000): Venue {
    const sections: Section[] = [];
    const seatsPerRow = 30;
    const rowsPerSection = 15;
    const seatsPerSection = seatsPerRow * rowsPerSection;
    const numSections = Math.ceil(targetSeatCount / seatsPerSection);
    const cols = Math.ceil(Math.sqrt(numSections * 1.5));
    const sectionWidth = seatsPerRow * 20 + 40;
    const sectionHeight = rowsPerSection * 22 + 40;
    let seatCounter = 0;
    for (let i = 0; i < numSections && seatCounter < targetSeatCount; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const catIdx = row % CATEGORIES.length;
      const rows: Row[] = [];
      for (let r = 0; r < rowsPerSection && seatCounter < targetSeatCount; r++) {
        const seats: Seat[] = [];
        const startX = -((seatsPerRow - 1) * 20) / 2;
        for (let s = 0; s < seatsPerRow && seatCounter < targetSeatCount; s++) {
          seats.push({
            id: `s${seatCounter}`,
            label: `${s + 1}`,
            position: { x: startX + s * 20, y: r * 22 },
            status: Math.random() > 0.1 ? "available" : "sold",
            categoryId: CATEGORIES[catIdx].id,
          });
          seatCounter++;
        }
        rows.push({
          id: `sec${i}-r${r}`,
          label: String.fromCharCode(65 + r),
          seats,
        });
      }
      sections.push({
        id: `sec-${i}`,
        label: `Section ${i + 1}`,
        position: {
          x: col * (sectionWidth + 30) + sectionWidth / 2,
          y: row * (sectionHeight + 30) + sectionHeight / 2,
        },
        rotation: 0,
        categoryId: CATEGORIES[catIdx].id,
        rows,
        outline: [],
      });
    }
    return {
      id: "generated-venue",
      name: `Venue (${seatCounter.toLocaleString()} seats)`,
      bounds: {
        width: cols * (sectionWidth + 30),
        height: Math.ceil(numSections / cols) * (sectionHeight + 30),
      },
      categories: CATEGORIES,
      seatStatuses: DEFAULT_SEAT_STATUSES.map((status) => ({ ...status })),
      sections,
      gaAreas: [],
      tables: [],
    };
  }