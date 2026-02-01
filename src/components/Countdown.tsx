import React, { useEffect, useMemo, useState } from "react";

type Labels = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

type CountdownProps = {
  targetDate: string | number | Date;
  labels?: Labels;  // 👈 Optional
  className?: string;
};

type Remaining = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function toDate(input: CountdownProps["targetDate"]): Date {
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input);

  // string: intenta robusto
  const d = new Date(input);

  // Fallback por si el navegador devuelve Invalid Date (común en Safari con ciertos formatos)
  if (Number.isNaN(d.getTime()) && typeof input === 'string') {
    // Intento simple: reemplazar " " por "T" si vino con espacio
    const cleaned = input.replace(" ", "T");
    const d2 = new Date(cleaned);
    return d2;
  }

  return d;
}

function calcRemaining(target: Date): Remaining {
  const now = Date.now();
  const totalMs = target.getTime() - now;

  const safeMs = Math.max(0, totalMs);
  const totalSeconds = Math.floor(safeMs / 1000);

  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return { totalMs, days, hours, minutes, seconds };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export const Countdown: React.FC<CountdownProps> = ({ 
  targetDate, 
  labels = { days: "DÍAS", hours: "HRS", minutes: "MIN", seconds: "SEG" },
  className }) => {
  const target = useMemo(() => toDate(targetDate), [targetDate]);

  // 👇 Clave: calcular YA en el primer render (no esperar al useEffect) para evitar parpadeo o null
  const [remaining, setRemaining] = useState<Remaining>(() => calcRemaining(target));

  useEffect(() => {
    // Si la fecha es inválida, evita intervalos infinitos y muestra ceros
    if (Number.isNaN(target.getTime())) {
      setRemaining({ totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    // Actualiza inmediatamente por si cambió targetDate
    setRemaining(calcRemaining(target));

    const id = window.setInterval(() => {
      setRemaining(calcRemaining(target));
    }, 1000);

    return () => window.clearInterval(id);
  }, [target]);

  const isClosed = remaining.totalMs <= 0 && !Number.isNaN(target.getTime());

  return (
    <div className={`relative z-40 w-full flex justify-center ${className ?? ""}`}>
      <div className="grid grid-cols-4 gap-0.5 sm:gap-1 md:gap-2 lg:gap-3 xl:gap-6 bg-white/95 backdrop-blur-md rounded-2xl px-1 py-1 sm:px-2 sm:py-2 md:px-4 md:py-3 lg:px-8 lg:py-6 shadow-2xl border-2 border-white/50 ring-4 ring-black/5 transform hover:scale-105 transition-transform duration-500">
        <TimeBox value={String(remaining.days)} label={labels.days} color="text-sky-600" />
        <TimeBox value={pad2(remaining.hours)} label={labels.hours} color="text-violet-600" />
        <TimeBox value={pad2(remaining.minutes)} label={labels.minutes} color="text-pink-600" />
        <TimeBox value={pad2(remaining.seconds)} label={labels.seconds} color="text-amber-500" />
      </div>

      {isClosed && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] md:text-[10px] lg:text-sm font-black tracking-widest text-white bg-red-600 px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 rounded-full shadow-lg whitespace-nowrap border-2 border-white animate-pulse z-50">
          INSCRIPCIONES CERRADAS
        </div>
      )}
    </div>
  );
};

const TimeBox: React.FC<{ value: string; label: string; color?: string }> = ({ value, label, color = "text-violet-900" }) => (
  <div className="flex flex-col items-center justify-center min-w-[32px] sm:min-w-[45px] md:min-w-[60px] lg:min-w-[90px] px-0.5 py-0.5 sm:px-1 sm:py-1">
    <div className={`text-base sm:text-xl md:text-3xl lg:text-6xl font-display leading-none ${color} drop-shadow-sm`} style={{ WebkitTextStroke: '1px rgba(0,0,0,0.05)' }}>
      {value}
    </div>
    <div className="text-[5px] sm:text-[7px] md:text-[9px] lg:text-xs font-black tracking-[0.08em] sm:tracking-[0.15em] md:tracking-[0.2em] text-slate-400 mt-0 sm:mt-0.5 md:mt-1 lg:mt-2 uppercase">
      {label}
    </div>
  </div>
);

export default Countdown;