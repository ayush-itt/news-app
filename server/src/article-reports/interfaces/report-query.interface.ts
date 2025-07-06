export interface IReportsQuery {
  page?: number;
  limit?: number;
  status?: 'all' | 'pending' | 'resolved';
}

export interface IPaginationParams {
  page: number;
  limit: number;
  status: 'all' | 'pending' | 'resolved';
}
