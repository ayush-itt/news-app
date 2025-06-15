export interface BaseRepositoryInterface<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  updateById(id: number, updateData: Partial<T>): Promise<T | null>;
  deleteById(id: number): Promise<boolean>;
}
