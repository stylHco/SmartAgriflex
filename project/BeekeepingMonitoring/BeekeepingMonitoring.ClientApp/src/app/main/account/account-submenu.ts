import {MenuItem} from "primeng/api";

export function createAccountSubmenu(baseUrl: string): MenuItem[] {
  return [
    {
      label: 'General',
      routerLink: [baseUrl, 'general'],
    },
    {
      label: 'Password',
      routerLink: [baseUrl, 'password'],
    },
  ];
}
