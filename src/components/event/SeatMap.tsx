import { ScrollReveal } from '@/components/shared/ScrollReveal';

export function SeatMap() {
  return (
    <ScrollReveal>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="ds-heading-lg tracking-tight">Схема зала</h3>
            <p className="ds-body-sm text-[var(--ds-on-surface-variant)]">
              Примерная схема расположения зон
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm ds-seat-free" />
              <span className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                Свободно
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm ds-seat-free-vip" />
              <span className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                VIP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm ds-seat-sold" />
              <span className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                Занято
              </span>
            </div>
          </div>
        </div>

        <div className="aspect-[16/9] bg-[var(--ds-surface-container-lowest)] rounded-[var(--ds-radius-structural)] p-8 md:p-12 ds-ghost-border relative overflow-hidden">
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            {/* Stage indicator */}
            <div className="w-48 h-4 bg-[var(--ds-primary-wash)] rounded-full mb-8 blur-[1px]" />

            {/* Row 1 - VIP */}
            <div className="flex justify-center gap-2">
              {[1, 0, 1, 1, 0, 1].map((free, i) => (
                <div
                  key={`r1-${i}`}
                  className={`w-4 h-4 rounded-sm ${free ? 'ds-seat-free-vip' : 'ds-seat-sold'}`}
                  role="presentation"
                />
              ))}
            </div>

            {/* Row 2 - VIP */}
            <div className="flex justify-center gap-2">
              {[1, 1, 1, 0, 1, 1, 1].map((free, i) => (
                <div
                  key={`r2-${i}`}
                  className={`w-5 h-5 rounded-sm ${free ? 'ds-seat-free-vip' : 'ds-seat-sold'}`}
                  role="presentation"
                />
              ))}
            </div>

            {/* Row 3 - Regular */}
            <div className="flex justify-center gap-2">
              {[0, 0, 1, 1, 0, 0, 0, 1, 1].map((free, i) => (
                <div
                  key={`r3-${i}`}
                  className={`w-6 h-6 rounded-sm ${free ? 'ds-seat-free' : 'ds-seat-sold'}`}
                  role="presentation"
                />
              ))}
            </div>

            {/* Row 4 - Balcony */}
            <div className="flex justify-center gap-2 mt-4">
              {[1, 1, 0, 1, 1].map((free, i) => (
                <div
                  key={`r4-${i}`}
                  className={`w-6 h-6 rounded-sm ${free ? 'ds-seat-free-cool' : 'ds-seat-sold'}`}
                  role="presentation"
                />
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--ds-surface-container-lowest)] to-transparent pointer-events-none" />
        </div>
      </div>
    </ScrollReveal>
  );
}
