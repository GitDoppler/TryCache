export interface CacheLine {
  valid: boolean;
  tag: number;
  data: string;
  dirty: boolean;
  lruCounter: number;
}

export interface CacheSet {
  lines: CacheLine[];
}

export interface Cache {
  sets: CacheSet[];
}
