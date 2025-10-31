export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type BaseRelationship = {
  foreignKeyName: string;
  columns: string[];
  referencedRelation: string;
  referencedColumns: string[];
  isOneToOne?: boolean;
};

type BaseTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: BaseRelationship[];
};

type BaseView = {
  Row: Record<string, unknown>;
  Relationships: BaseRelationship[];
};

type BaseFunction = {
  Args: Record<string, unknown> | undefined;
  Returns: unknown;
};

type ProgressSessionsTable = {
  Row: {
    id: string;
    user_id: string | null;
    device_id: string | null;
    mode_id: string | null;
    protocol_id: string | null;
    name: string | null;
    beat_frequency: number | null;
    carrier_left: number | null;
    carrier_right: number | null;
    duration_seconds: number;
    started_at: string;
    ended_at: string | null;
    completed: boolean;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id?: string | null;
    device_id?: string | null;
    mode_id?: string | null;
    protocol_id?: string | null;
    name?: string | null;
    beat_frequency?: number | null;
    carrier_left?: number | null;
    carrier_right?: number | null;
    duration_seconds: number;
    started_at?: string;
    ended_at?: string | null;
    completed?: boolean;
    created_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string | null;
    device_id?: string | null;
    mode_id?: string | null;
    protocol_id?: string | null;
    name?: string | null;
    beat_frequency?: number | null;
    carrier_left?: number | null;
    carrier_right?: number | null;
    duration_seconds?: number;
    started_at?: string;
    ended_at?: string | null;
    completed?: boolean;
    created_at?: string;
  };
  Relationships: never[];
};

type PublicSchema = {
  Tables: {
    progress_sessions: ProgressSessionsTable;
  } & Record<string, BaseTable>;
  Views: {
    progress_daily_totals: {
      Row: {
        owner_key: string | null;
        day: string;
        sessions: number | null;
        total_completed_seconds: number | null;
        total_logged_seconds: number | null;
      };
      Relationships: never[];
    };
  } & Record<string, BaseView>;
  Functions: Record<string, BaseFunction>;
  Enums: Record<string, string>;
  CompositeTypes: Record<string, Record<string, unknown>>;
};

export type Database = {
  public: PublicSchema;
};
