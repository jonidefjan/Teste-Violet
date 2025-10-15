export type FarmerDTO = {
  id: string;
  fullName: string;
  cpf: string;
  birthDate: string | null;
  phone: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FarmerFilters = {
  fullName?: string;
  cpf?: string;
  active?: "true" | "false";
};

export type CreateFarmerInput = {
  fullName: string;
  cpf: string;
  birthDate?: string;
  phone?: string;
  active?: boolean;
};

export type UpdateFarmerInput = {
  fullName: string;
  birthDate?: string | null;
  phone?: string | null;
  active: boolean;
};
