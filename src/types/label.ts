export interface Label {
  _id: string;
  organizationId: string;
  projectId: string;
  name: string;
  color: string;
  createdBy: string;
}

export interface CreateLabelInput {
  name: string;
  color: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
}
