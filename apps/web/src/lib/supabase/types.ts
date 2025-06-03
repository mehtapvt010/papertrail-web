export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // your_table_name: {
      //   Row: {}; // The data expected to be returned from a "select" statement.
      //   Insert: {}; // The data expected passed to an "insert" statement.
      //   Update: {}; // The data expected passed to an "update" statement.
      // };
    };
    Views: {
      // your_view_name: {
      //   Row: {}; // The data expected to be returned from a "select" statement.
      // };
    };
    Functions: {
      // your_function_name: {
      //   Args: {}; // The arguments passed to the function.
      //   Returns: {}; // The data expected to be returned from the function.
      // };
    };
  };
};