// src/types/index.ts

export interface ComponentProps {
    title: string;
    isActive: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export type Status = 'active' | 'inactive' | 'pending';