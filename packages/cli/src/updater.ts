import updateNotifier from 'tiny-update-notifier';
import { name, version } from '@/package.json' with { type: 'json' };

export async function checkUpdate() {
    return await updateNotifier({ pkg: { name, version } });
}
