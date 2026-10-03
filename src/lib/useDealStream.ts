"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DealEvent, DealScenario, Mode, PnLSnapshot } from "./types";

export interface DealState {
  scenario: DealScenario | null;
  mode: Mode | null;
  events: DealEvent[];
  pnl: PnLSnapshot;
  done: boolean;
  error: string | null;
  elapsedMs: number;
  connecting: boolean;
}

const initialPnl: PnLSnapshot = {
  listPriceUSD: 0,
  costUSD: 0,
  agreedPriceUSD: null,
  marginPct: null,
  daysOnShelfCleared: 0,
  fulfillment: null,
  status: "open",
};

export function useDealStream(scenarioId: string, speed: number) {
  const [state, setState] = useState<DealState>({
    scenario: null,
    mode: null,
    events: [],
    pnl: initialPnl,
    done: false,
    error: null,
    elapsedMs: 0,
    connecting: true,
  });
  const [run, setRun] = useState(0);
  const esRef = useRef<EventSource | null>(null);

  const restart = useCallback(() => setRun((r) => r + 1), []);

  useEffect(() => {
    esRef.current?.close();
    const es = new EventSource(`/api/deal/${scenarioId}/stream?speed=${speed}`);
    esRef.current = es;
    es.onmessage = (m) => {
      const data = JSON.parse(m.data);
      if (data.type === "meta") {
        // fresh run: reset everything when the server announces the scenario
        setState({ scenario: data.scenario, mode: data.mode, events: [], pnl: initialPnl, done: false, error: null, elapsedMs: 0, connecting: false });
      } else if (data.type === "event") {
        const ev = data.event as DealEvent;
        setState((s) => ({
          ...s,
          events: [...s.events, ev],
          pnl: ev.pnl ? { ...s.pnl, ...ev.pnl } : s.pnl,
          elapsedMs: ev.t,
        }));
      } else if (data.type === "done") {
        setState((s) => ({ ...s, done: true }));
        es.close();
      } else if (data.type === "error") {
        setState((s) => ({ ...s, error: data.message, done: true }));
        es.close();
      }
    };
    es.onerror = () => {
      setState((s) => (s.done ? s : { ...s, error: s.events.length ? null : "stream disconnected", done: true }));
      es.close();
    };
    return () => es.close();
  }, [scenarioId, speed, run]);

  return { ...state, restart };
}
