import { unsafeWindow } from '$';

export function getSelfId(): string {
	return (unsafeWindow as any).dataLayer?.[0]?.user_id ?? '';
}
