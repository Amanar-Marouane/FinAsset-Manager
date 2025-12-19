import { ApiError } from "@/hooks/use-api";

export function backErrors(error: ApiError): void {
    document.querySelectorAll('.error-p').forEach((el) => {
        el.innerHTML = '';
    });

    if (error.status === 422) {
        const entries = Object.entries(error.errors as Record<string, string[]>);
        for (const [key, messages] of entries) {
            const normalizedKey = key.replace('.', '-');
            const p = document.querySelector(`.${normalizedKey}-error`);
            if (p !== null) {
                const firstMessage =
                    Array.isArray(messages) && typeof messages[0] === 'string'
                        ? messages[0]
                        : '';
                p.innerHTML = firstMessage ?? '';
            }
        }
    }
}
