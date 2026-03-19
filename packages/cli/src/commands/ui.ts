import { checkUpdate } from '@/updater';
import { initializeUi } from '@palettecn/terminal';

export function uiCommand(cssPath?: string) {
    initializeUi(cssPath, checkUpdate);
}
