export interface FormulaItem {
  id: number;
  title: string;
  koefficent: number;
  created_at: string;
}

export interface FormulaUpdateBody {
  title: string;
  koefficent: number;
}

export interface FormulaListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FormulaItem[];
}

export interface IGetFormulasParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}
