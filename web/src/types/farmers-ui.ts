export type FarmerFiltersState = {
  fullName: string;
  cpf: string;
  active: "all" | "true" | "false";
};

export type FarmerFormState = {
  fullName: string;
  cpf: string;
  birthDate: string;
  phone: string;
  active: boolean;
};

export type FormMessage = {
  type: "success" | "error";
  text: string;
};
