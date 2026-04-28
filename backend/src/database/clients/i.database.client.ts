import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

@Injectable()
export abstract class IDatabaseClient extends SupabaseClient<Database> {}
