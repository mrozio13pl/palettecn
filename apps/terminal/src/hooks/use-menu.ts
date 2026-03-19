import { create } from 'zustand';

export interface MenuItem {
    label: string;
    onSelect: () => void;
    preview?: string;
}

export interface MenuInput {
    title: string;
    placeholder?: string;
    onSubmit: (value: string) => void;
}

export interface MenuState {
    isOpen: boolean;
    title?: string;
    items?: MenuItem[];
    input?: MenuInput;
    mode: 'items' | 'input';
    setMenu: (menu: { title: string; items: MenuItem[] }) => void;
    setInput: (input: MenuInput) => void;
    closeMenu: () => void;
}

export const useMenu = create<MenuState>((set) => ({
    isOpen: false,
    mode: 'items',
    setMenu: (menu) => set({ isOpen: true, mode: 'items', ...menu }),
    setInput: (input) => set({ isOpen: true, mode: 'input', input }),
    closeMenu: () => set({ isOpen: false } as Partial<MenuState>),
}));
