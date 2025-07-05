import type { LinkedInPostResponse, LinkedInAuthResponse } from '../types';
export declare const getAuthUrl: () => string;
export declare const handleAuthCallback: (code: string) => Promise<LinkedInAuthResponse>;
export declare const publishToLinkedIn: (content: string) => Promise<LinkedInPostResponse>;
export declare const getLinkedInStatus: () => {
    connected: boolean;
    profile?: LinkedInAuthResponse["profile"];
};
export declare const disconnectLinkedIn: () => void;
//# sourceMappingURL=linkedInService.d.ts.map