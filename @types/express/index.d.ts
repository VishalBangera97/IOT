import { AdminDocument } from './../../src/models/admin';
import { UserDocument } from './../../src/models/user';

declare global {
    namespace Express {
        interface Request {
            user: UserDocument;
            token: string;
            admin: AdminDocument;
        }

    }
}