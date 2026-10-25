export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiProblem {
  code: string;
  detail?: string;
  errors: ApiFieldError[];
}
