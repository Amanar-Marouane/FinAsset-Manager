export function backErrors(error) {
    document.querySelectorAll('.error-p').forEach(el => el.innerHTML = '');
    if (error.status === 422) {
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
            let normalizedKey = key.replace('.', '-');
            let p = document.querySelector('.' + normalizedKey + '-error');
            if (p) p.innerHTML = messages[0];
        });
    }
}