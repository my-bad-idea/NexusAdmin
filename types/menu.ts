export interface MenuItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  permCode: string;
  children?: MenuItem[];
  badge?: number;
}
