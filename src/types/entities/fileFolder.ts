export interface ICategory {
  id: string;
  title: string;
}

export interface IFileItem {
  id: number;
  folder: number;
  file: string;
  uploaded_at: string;
  ty?: string;
}

export interface IFileFolderFolder {
  required: {
    id: string;
    title: string;
    description: string;
    category: ICategory & { description: string };
    require: boolean;
    ty?: string;
    created_at: string;
    filled: boolean;
  }[];
  custom: {
    id: string;
    title: string;
    description: string;
    category: ICategory & { description: string };
    require: boolean;
    ty?: string;
    created_at: string;
    filled: boolean;
  }[];
}
