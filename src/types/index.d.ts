export interface RedisRequestQueue {
  id: string;
}

export interface UserParams {
  userId: string;
}

export interface SymbolParams {
  stockSymbol: string;
}

export interface PushResponseParams {
  id: string;
  status: string;
  data: string;
}
