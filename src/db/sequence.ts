import { db } from './db';
import { getTodayDateSequenceFormat } from '../utils/date';

/**
 * Generates the next sequential unique bill number in the format:
 * AST-YYYYMMDD-### (e.g., AST-20260916-001)
 * Guaranteed unique and sequential per calendar day.
 */
export async function getNextBillNumber(dateObj = new Date()): Promise<string> {
  const dateKey = getTodayDateSequenceFormat(dateObj); // e.g. "20260916"

  return await db.transaction('rw', [db.dailySequences, db.bills], async () => {
    // 1. Get current sequence for today
    const currentSeqRecord = await db.dailySequences.get(dateKey);
    let nextSeq = (currentSeqRecord?.lastSeq || 0) + 1;

    // 2. Loop to guarantee uniqueness if any historical collisions exist
    let candidateBillNumber = '';
    let exists = true;

    while (exists) {
      const paddedSeq = String(nextSeq).padStart(3, '0');
      candidateBillNumber = `AST-${dateKey}-${paddedSeq}`;

      const existingBill = await db.bills.where('billNumber').equals(candidateBillNumber).first();
      if (!existingBill) {
        exists = false;
      } else {
        nextSeq++;
      }
    }

    // 3. Save the incremented sequence
    await db.dailySequences.put({
      date: dateKey,
      lastSeq: nextSeq
    });

    return candidateBillNumber;
  });
}
