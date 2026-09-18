import { db } from './db';

/**
 * Global sequence key stored in dailySequences table.
 * Using 'GLOBAL' so the bill counter is continuous across all days.
 */
const GLOBAL_SEQ_KEY = 'GLOBAL';

/**
 * Generates the next sequential unique bill number in the format:
 * A.S.P-001, A.S.P-002, ... (global sequential, not date-based)
 * Guaranteed unique and collision-free.
 */
export async function getNextBillNumber(_dateObj = new Date()): Promise<string> {
  return await db.transaction('rw', [db.dailySequences, db.bills], async () => {
    // 1. Get current global sequence
    const currentSeqRecord = await db.dailySequences.get(GLOBAL_SEQ_KEY);
    let nextSeq = (currentSeqRecord?.lastSeq || 0) + 1;

    // 2. Loop to guarantee uniqueness if any historical collisions exist
    let candidateBillNumber = '';
    let exists = true;

    while (exists) {
      const paddedSeq = String(nextSeq).padStart(3, '0');
      candidateBillNumber = `A.S.P-${paddedSeq}`;

      const existingBill = await db.bills.where('billNumber').equals(candidateBillNumber).first();
      if (!existingBill) {
        exists = false;
      } else {
        nextSeq++;
      }
    }

    // 3. Save the incremented global sequence
    await db.dailySequences.put({
      date: GLOBAL_SEQ_KEY,
      lastSeq: nextSeq
    });

    return candidateBillNumber;
  });
}

/**
 * Recalculates and corrects the global sequence counter based on existing bills.
 * Call this after deleting a bill so that the next auto bill number stays accurate.
 * Finds the highest A.S.P-### number from saved bills and updates the counter.
 */
export async function recalculateGlobalSequence(): Promise<void> {
  await db.transaction('rw', [db.dailySequences, db.bills], async () => {
    const allBills = await db.bills.toArray();

    // Extract the numeric part from all A.S.P-### formatted bill numbers
    let maxSeq = 0;
    for (const bill of allBills) {
      const match = bill.billNumber.match(/^A\.S\.P-(\d+)$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    }

    // Update the global sequence to the highest found (or 0 if no bills)
    await db.dailySequences.put({
      date: GLOBAL_SEQ_KEY,
      lastSeq: maxSeq
    });
  });
}
