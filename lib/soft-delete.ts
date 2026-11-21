/** Row soft-deleted when deleted_at is a non-null timestamp. */
export type SoftDeletable = {
  deleted_at?: string | null;
};

export function isNotDeleted<T extends SoftDeletable>(row: T): boolean {
  return row.deleted_at == null;
}

export function filterActive<T extends SoftDeletable>(rows: T[]): T[] {
  return rows.filter(isNotDeleted);
}
