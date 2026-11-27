import type { EntryData } from '../../types';

export const compareEntryIds = (a: EntryData, b: EntryData) =>
  String(a.entry_id ?? '').localeCompare(String(b.entry_id ?? ''));

export const compareEntryNames = (a: EntryData, b: EntryData) =>
  (a.entry_name || '').localeCompare(b.entry_name || '', 'zh-CN');

export const entrySearchTerms = (value: string) => value.toLowerCase().trim().split(/\s+/).filter(Boolean);

export const entrySearchFields = (entry: EntryData) =>
  [entry.entry_name, entry.explanation, entry.entry_type, entry.superposability, entry.talisman, entry.entry_id].map(
    (value) => String(value ?? '').toLowerCase(),
  );
