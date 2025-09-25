const URL = process.env.NEXT_PUBLIC_IMG_PROXY;

export function imageUrl(src) {
    return `${URL}${src}`;
}