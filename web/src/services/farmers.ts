import { normalizeCPF } from "@/lib/cpf";
import { stripPhoneDigits } from "@/lib/phone";
import type { FarmerFiltersState } from "@/types/farmers-ui";
import type {
  CreateFarmerInput,
  FarmerDTO,
  FarmerFilters,
  UpdateFarmerInput,
} from "@/types/farmer";
import { ensureSuccess, HttpError } from "./http";

const BASE_PATH = "/api/farmers";

const sanitizeCreatePayload = (payload: CreateFarmerInput) => ({
  fullName: payload.fullName.trim(),
  cpf: normalizeCPF(payload.cpf),
  birthDate: payload.birthDate?.trim() || undefined,
  phone: payload.phone ? stripPhoneDigits(payload.phone) : undefined,
  active: payload.active ?? true,
});

const sanitizeUpdatePayload = (payload: UpdateFarmerInput) => ({
  fullName: payload.fullName.trim(),
  birthDate: payload.birthDate?.trim() || undefined,
  phone: payload.phone ? stripPhoneDigits(payload.phone) : undefined,
  active: payload.active,
});

const buildQueryString = (filters: FarmerFilters) => {
  const params = new URLSearchParams();

  if (filters.fullName) {
    params.set("fullName", filters.fullName.trim());
  }

  if (filters.cpf) {
    params.set("cpf", normalizeCPF(filters.cpf));
  }

  if (filters.active) {
    params.set("active", filters.active);
  }

  return params.toString();
};

const parseData = async <Data>(response: Response) => {
  const json = (await response.json()) as { data: Data };
  return json.data;
};

const request = async (input: RequestInfo, init?: RequestInit) =>
  ensureSuccess(await fetch(input, init));

export const toFarmerFilters = (state: FarmerFiltersState): FarmerFilters => ({
  fullName: state.fullName.trim() || undefined,
  cpf: state.cpf,
  active: state.active === "all" ? undefined : state.active,
});

export const farmerApi = {
  list: async (filters: FarmerFilters, signal?: AbortSignal) => {
    const query = buildQueryString(filters);
    const response = await request(`${BASE_PATH}${query ? `?${query}` : ""}`, {
      signal,
    });
    return parseData<FarmerDTO[]>(response);
  },

  create: async (payload: CreateFarmerInput, signal?: AbortSignal) => {
    const response = await request(BASE_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizeCreatePayload(payload)),
      signal,
    });

    return parseData<FarmerDTO>(response);
  },

  update: async (
    id: string,
    payload: UpdateFarmerInput,
    signal?: AbortSignal
  ) => {
    if (!id) {
      throw new HttpError("Identificador inválido", 400);
    }

    const response = await request(`${BASE_PATH}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizeUpdatePayload(payload)),
      signal,
    });

    return parseData<FarmerDTO>(response);
  },

  remove: async (id: string, signal?: AbortSignal) => {
    if (!id) {
      throw new HttpError("Identificador inválido", 400);
    }

    await request(`${BASE_PATH}/${id}`, {
      method: "DELETE",
      signal,
    });
  },
};
