"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { formatCPF, isValidCPF, stripCPF } from "@/lib/cpf";
import { formatPhoneNumber, stripPhoneDigits } from "@/lib/phone";
import { normalizeHumanName } from "@/lib/text";
import { toDateInputValue } from "@/lib/date";
import { farmerApi, toFarmerFilters } from "@/services/farmers";
import { HttpError } from "@/services/http";
import type { FarmerDTO } from "@/types/farmer";
import type {
  FarmerFiltersState,
  FarmerFormState,
  FormMessage,
} from "@/types/farmers-ui";

const initialFilters: FarmerFiltersState = {
  fullName: "",
  cpf: "",
  active: "all",
};

const initialForm: FarmerFormState = {
  fullName: "",
  cpf: "",
  birthDate: "",
  phone: "",
  active: true,
};

const FarmersPage = () => {
  const [farmers, setFarmers] = useState<FarmerDTO[]>([]);
  const [filters, setFilters] = useState<FarmerFiltersState>(initialFilters);
  const [formState, setFormState] = useState<FarmerFormState>(initialForm);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FarmerFormState, string>>
  >({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  const handleFormFieldBlur = (field: keyof FarmerFormState) => {
    setFormState((previous) => {
      const currentValue = previous[field];
      if (typeof currentValue !== "string") {
        return previous;
      }
      const trimmed = currentValue.trim();
      if (trimmed === currentValue) {
        return previous;
      }
      return { ...previous, [field]: trimmed };
    });
  };

  const handleFilterFieldBlur = (field: keyof FarmerFiltersState) => {
    setFilters((previous) => {
      const currentValue = previous[field];
      if (typeof currentValue !== "string") {
        return previous;
      }
      const trimmed = currentValue.trim();
      if (trimmed === currentValue) {
        return previous;
      }
      return { ...previous, [field]: trimmed };
    });
  };

  const loadFarmers = useCallback(
    async (currentFilters: FarmerFiltersState = filters) => {
      setLoading(true);
      setMessage(null);
      try {
        const data = await farmerApi.list(toFarmerFilters(currentFilters));
        setFarmers(data);
      } catch (error) {
        if (error instanceof HttpError) {
          setMessage({ type: "error", text: error.message });
        } else {
          console.error("Erro ao carregar agricultores", error);
          setMessage({
            type: "error",
            text: "Não foi possível carregar os agricultores",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    loadFarmers();
  }, [loadFarmers]);

  const resetForm = useCallback(() => {
    setFormState(initialForm);
    setFormErrors({});
    setEditingId(null);
  }, []);

  const handleFilterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadFarmers(filters);
  };

  const handleFilterReset = async () => {
    const reset = { ...initialFilters };
    setFilters(reset);
    await loadFarmers(reset);
  };

  const handleFormChange = <Key extends keyof FarmerFormState>(
    field: Key,
    value: FarmerFormState[Key]
  ) => {
    setFormState((previous) => ({ ...previous, [field]: value }));
    setFormErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof FarmerFormState, string>> = {};

    if (!formState.fullName.trim()) {
      errors.fullName = "Informe o nome completo";
    }

    if (!editingId) {
      if (!formState.cpf) {
        errors.cpf = "Informe um CPF";
      } else if (!isValidCPF(formState.cpf)) {
        errors.cpf = "CPF inválido";
      }
    }

    if (formState.birthDate) {
      const birth = new Date(formState.birthDate);
      if (Number.isNaN(birth.getTime())) {
        errors.birthDate = "Data inválida";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      if (editingId) {
        await farmerApi.update(editingId, {
          fullName: formState.fullName,
          birthDate: formState.birthDate || undefined,
          phone: formState.phone || undefined,
          active: formState.active,
        });
      } else {
        await farmerApi.create({
          fullName: formState.fullName,
          cpf: formState.cpf,
          birthDate: formState.birthDate || undefined,
          phone: formState.phone || undefined,
          active: formState.active,
        });
      }

      await loadFarmers(filters);
      setMessage({
        type: "success",
        text: editingId ? "Agricultor atualizado" : "Agricultor cadastrado",
      });
      resetForm();
    } catch (error) {
      if (error instanceof HttpError) {
        setMessage({ type: "error", text: error.message });
      } else {
        console.error("Erro ao salvar agricultor", error);
        setMessage({
          type: "error",
          text: "Não foi possível salvar o agricultor",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (farmer: FarmerDTO) => {
    setEditingId(farmer.id);
    setFormState({
      fullName: farmer.fullName.trim(),
      cpf: farmer.cpf,
      birthDate: toDateInputValue(farmer.birthDate),
      phone: farmer.phone ? stripPhoneDigits(farmer.phone) : "",
      active: farmer.active,
    });
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (farmer: FarmerDTO) => {
    const confirmed = window.confirm(
      `Deseja remover ${farmer.fullName}? O registro precisa estar inativo para exclusão.`
    );
    if (!confirmed) return;

    setMessage(null);
    try {
      await farmerApi.remove(farmer.id);
      await loadFarmers(filters);
      setMessage({ type: "success", text: "Agricultor removido" });
    } catch (error) {
      if (error instanceof HttpError) {
        setMessage({ type: "error", text: error.message });
      } else {
        console.error("Erro ao remover agricultor", error);
        setMessage({
          type: "error",
          text: "Não foi possível remover o agricultor",
        });
      }
    }
  };

  const formattedFarmers = useMemo(
    () =>
      farmers.map((farmer) => ({
        ...farmer,
        cpfFormatted: formatCPF(farmer.cpf),
        phoneFormatted: farmer.phone ? formatPhoneNumber(farmer.phone) : null,
      })),
    [farmers]
  );

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? "Editar agricultor" : "Cadastrar agricultor"}
            </h2>
            <p className="text-sm text-slate-500">
              {editingId
                ? "Atualize os dados abaixo. O CPF não pode ser alterado após o cadastro."
                : "Preencha os dados obrigatórios para criar um novo agricultor."}
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              className="rounded-lg border border-transparent bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
              onClick={resetForm}
            >
              Cancelar edição
            </button>
          )}
        </header>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-2">
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="fullName"
            >
              Nome completo
            </label>
            <input
              id="fullName"
              name="fullName"
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                formErrors.fullName ? "border-red-400" : "border-slate-300"
              }`}
              value={formState.fullName}
              onChange={(event) =>
                handleFormChange(
                  "fullName",
                  normalizeHumanName(event.target.value)
                )
              }
              placeholder="Maria da Silva"
              autoComplete="name"
              onBlur={() => handleFormFieldBlur("fullName")}
              required
            />
            {formErrors.fullName && (
              <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>
            )}
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="cpf"
            >
              CPF
            </label>
            <input
              id="cpf"
              name="cpf"
              disabled={Boolean(editingId)}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                formErrors.cpf ? "border-red-400" : "border-slate-300"
              } ${editingId ? "bg-slate-100 text-slate-700" : "bg-white"}`}
              value={formatCPF(formState.cpf)}
              onChange={(event) => {
                if (editingId) return;
                const digits = stripCPF(event.target.value).slice(0, 11);
                handleFormChange("cpf", digits);
              }}
              placeholder="000.000.000-00"
              inputMode="numeric"
              onBlur={() => handleFormFieldBlur("cpf")}
              required
            />
            {formErrors.cpf && (
              <p className="mt-1 text-xs text-red-500">{formErrors.cpf}</p>
            )}
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="birthDate"
            >
              Data de nascimento
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                formErrors.birthDate ? "border-red-400" : "border-slate-300"
              }`}
              value={formState.birthDate}
              onChange={(event) =>
                handleFormChange("birthDate", event.target.value)
              }
              onBlur={() => handleFormFieldBlur("birthDate")}
            />
            {formErrors.birthDate && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.birthDate}
              </p>
            )}
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="phone"
            >
              Telefone
            </label>
            <input
              id="phone"
              name="phone"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              value={formatPhoneNumber(formState.phone)}
              onChange={(event) =>
                handleFormChange("phone", stripPhoneDigits(event.target.value))
              }
              onBlur={() => handleFormFieldBlur("phone")}
              placeholder="(11) 99999-0000"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="active"
            >
              Status
            </label>
            <select
              id="active"
              name="active"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              value={String(formState.active)}
              onChange={(event) =>
                handleFormChange("active", event.target.value === "true")
              }
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              disabled={submitting}
            >
              {submitting
                ? "Salvando..."
                : editingId
                ? "Salvar alterações"
                : "Cadastrar"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              onClick={resetForm}
              disabled={submitting}
            >
              Limpar formulário
            </button>
            {editingId && (
              <span className="text-xs text-slate-500">
                CPF cadastrado: <strong>{formatCPF(formState.cpf)}</strong>
              </span>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Lista de agricultores
            </h2>
            <p className="text-sm text-slate-500">
              Utilize os filtros para localizar rapidamente agricultores pelo
              nome, CPF ou status.
            </p>
          </div>
          <form
            className="grid gap-3 sm:grid-cols-4"
            onSubmit={handleFilterSubmit}
          >
            <div className="sm:col-span-2">
              <label
                className="mb-1 block text-xs font-medium text-slate-600"
                htmlFor="filterFullName"
              >
                Nome
              </label>
              <input
                id="filterFullName"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={filters.fullName}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    fullName: normalizeHumanName(event.target.value),
                  }))
                }
                onBlur={() => handleFilterFieldBlur("fullName")}
                placeholder="Pesquisar por nome"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-xs font-medium text-slate-600"
                htmlFor="filterCpf"
              >
                CPF
              </label>
              <input
                id="filterCpf"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={formatCPF(filters.cpf)}
                onChange={(event) => {
                  const digits = stripCPF(event.target.value).slice(0, 11);
                  setFilters((previous) => ({ ...previous, cpf: digits }));
                }}
                onBlur={() => handleFilterFieldBlur("cpf")}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label
                className="mb-1 block text-xs font-medium text-slate-600"
                htmlFor="filterActive"
              >
                Status
              </label>
              <select
                id="filterActive"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={filters.active}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    active: event.target.value as FarmerFiltersState["active"],
                  }))
                }
              >
                <option value="all">Todos</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                disabled={loading}
              >
                Filtrar
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                onClick={handleFilterReset}
                disabled={loading}
              >
                Limpar
              </button>
            </div>
          </form>
        </header>

        {message && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <p className="text-xs text-slate-500">
          Somente agricultores inativos podem ser excluídos. Altere o status
          antes de tentar remover um registro ativo.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Nome</th>
                <th className="px-4 py-3 font-medium text-slate-600">CPF</th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Nascimento
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Telefone
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-slate-500"
                    colSpan={6}
                  >
                    Carregando agricultores...
                  </td>
                </tr>
              ) : formattedFarmers.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-slate-500"
                    colSpan={6}
                  >
                    Nenhum agricultor encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                formattedFarmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">
                      {farmer.fullName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {farmer.cpfFormatted}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {farmer.birthDate
                        ? new Date(farmer.birthDate).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {farmer.phoneFormatted ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          farmer.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {farmer.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                          onClick={() => handleEdit(farmer)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-600 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          onClick={() => handleDelete(farmer)}
                          disabled={farmer.active}
                          title={
                            farmer.active
                              ? "Apenas agricultores inativos podem ser excluídos"
                              : "Excluir agricultor"
                          }
                        >
                          {farmer.active ? "Excluir (inativo)" : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default FarmersPage;
