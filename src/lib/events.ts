import type { Amplifier } from './amplifiers';

/**
 * Every learner interaction worth recording goes through here.
 *
 * Nothing is persisted. There is no backend, no storage and no identifier, and
 * adding one later must not mean touching a single component: a sink is
 * registered once with `subscribe`, and the event shapes below are the contract
 * it will receive. The in-memory log exists because the module reads its own
 * commitments back to the learner at the end — that is a page-lifetime concern,
 * not a record.
 *
 * Field names follow the specification exactly, including snake_case, so the
 * shapes can be matched against it without translation.
 */

export type Confidence = 'guessing' | 'fairly-sure' | 'certain';

export const CONFIDENCE_LABELS: Readonly<Record<Confidence, string>> = {
  guessing: 'Guessing',
  'fairly-sure': 'Fairly sure',
  certain: 'Certain',
};

/** What the learner committed to, before being shown anything. */
export interface CommitEvent {
  type: 'commit';
  beat: number;
  prompt_id: string;
  response: string;
  /** Null where the commitment is an acknowledgement rather than an answer. */
  confidence: Confidence | null;
  t: number;
}

/** What they were shown afterwards, and how far it was from what they said. */
export interface RevealEvent {
  type: 'reveal';
  beat: number;
  prompt_id: string;
  correct: boolean;
  /** response - truth, or null when the response was not a number. */
  delta_from_response: number | null;
}

/** A move of the truncation-order control, and what the reader saw as a result. */
export interface SliderMoveEvent {
  type: 'slider_move';
  question_id: string;
  order_kept: number;
  value_shown: string;
  t: number;
}

/** A bank question attempted, self-marked. */
export interface BankAttemptEvent {
  type: 'bank_attempt';
  question_id: string;
  amplifier: Amplifier;
  self_reported_outcome: 'got-it' | 'got-there-slowly' | 'stuck';
}

/** An auto-marked measurement item. */
export interface MeasureEvent {
  type: 'measure';
  item_id: string;
  response: string;
  correct: boolean;
  /** How many orders past leading the learner said were needed, where asked. */
  orders_predicted: number | null;
}

export type LearningEvent =
  | CommitEvent
  | RevealEvent
  | SliderMoveEvent
  | BankAttemptEvent
  | MeasureEvent;

export type EventSink = (event: LearningEvent) => void;

/**
 * The log and its sinks hang off a global, not off this module's scope.
 *
 * A module page carries more than one island — the beats, and the closing bank
 * and measurement — and the last of those reads back commitments made in the
 * first. Whether a bundler gives two islands one shared copy of this module or
 * two copies is its business, not something the calibration read-back should
 * depend on, so the store is keyed by symbol and shared either way.
 */
interface EventStore {
  log: LearningEvent[];
  sinks: Set<EventSink>;
}

const STORE_KEY = Symbol.for('failure-modes.events');

function store(): EventStore {
  const host = globalThis as unknown as Record<symbol, EventStore | undefined>;
  const existing = host[STORE_KEY];
  if (existing) return existing;
  const created: EventStore = { log: [], sinks: new Set() };
  host[STORE_KEY] = created;
  return created;
}

/**
 * Register a sink. This is the whole extension point: a future persistent store
 * subscribes here and no component changes.
 */
export function subscribe(sink: EventSink): () => void {
  const { sinks } = store();
  sinks.add(sink);
  return () => {
    sinks.delete(sink);
  };
}

export function emit(event: LearningEvent): void {
  const { log, sinks } = store();
  log.push(event);
  for (const sink of sinks) sink(event);
}

/** Everything emitted this page-load, oldest first. */
export function history(): readonly LearningEvent[] {
  return store().log;
}

/** The learner's commitments, for reading back to them at the end. */
export function commits(): readonly CommitEvent[] {
  return store().log.filter((event): event is CommitEvent => event.type === 'commit');
}

export function commitFor(promptId: string): CommitEvent | undefined {
  return commits().find((event) => event.prompt_id === promptId);
}

/** How a commitment turned out, where the module marked it at the time. */
export function revealFor(promptId: string): RevealEvent | undefined {
  return store()
    .log.filter((event): event is RevealEvent => event.type === 'reveal')
    .find((event) => event.prompt_id === promptId);
}

/** Tests only: the log is page-lifetime state and nothing else should clear it. */
export function resetEvents(): void {
  const { log, sinks } = store();
  log.length = 0;
  sinks.clear();
}
