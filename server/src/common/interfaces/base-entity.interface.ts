export interface ITimestamp {
  createdAt: Date;
  updatedAt: Date;
}

export interface IBaseEntity extends ITimestamp {
  id: number;
}

export interface IActiveEntity {
  isActive: boolean;
}
