export interface Stage {
  _id: string;
  organizationId: string;
  projectId: string;
  name: string;
  color: string;
  order: number;
  isDoneStage: boolean;
  wipLimit: number | null;
  createdBy: string;
}

export interface CreateStageInput {
  name: string;
  color?: string;
  wipLimit?: number | null;
}

export interface UpdateStageInput {
  name?: string;
  color?: string;
  isDoneStage?: boolean;
  wipLimit?: number | null;
}
