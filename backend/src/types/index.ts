import { Request } from 'express';

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminPayload;
}

