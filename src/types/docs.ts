export interface ComponentDoc {
    id: string;
    name: string;
    description: string;
    category: string;
    path: string;
    props?: Array<{
        name: string;
        type: string;
        required?: boolean;
        description: string;
        default?: string;
    }>;
    examples?: Array<{
        title: string;
        code: string;
        description?: string;
    }>;
    dependencies?: string[];
}

export interface Category {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    count: number;
}
