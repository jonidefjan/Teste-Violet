import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { connectMongo } from "@/lib/mongodb";
import { assertValidCPF, normalizeCPF } from "@/lib/cpf";
import { Farmer } from "@/models/farmer";

const createFarmerSchema = z.object({
  fullName: z.string().min(3, "Informe o nome completo"),
  cpf: z.string(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
});

const buildFilters = (searchParams: URLSearchParams) => {
  const filters: Record<string, unknown> = {};

  const fullName = searchParams.get("fullName");
  if (fullName) {
    filters.fullName = { $regex: fullName, $options: "i" };
  }

  const cpf = searchParams.get("cpf");
  if (cpf) {
    filters.cpf = normalizeCPF(cpf);
  }

  const active = searchParams.get("active");
  if (active === "true") {
    filters.active = true;
  } else if (active === "false") {
    filters.active = false;
  }

  return filters;
};

const serializeFarmer = (farmer: InstanceType<typeof Farmer>) => ({
  id: farmer.id,
  fullName: farmer.fullName,
  cpf: farmer.cpf,
  birthDate: farmer.birthDate ? farmer.birthDate.toISOString() : null,
  phone: farmer.phone ?? null,
  active: farmer.active,
  createdAt: farmer.createdAt.toISOString(),
  updatedAt: farmer.updatedAt.toISOString(),
});

export const GET = async (request: Request) => {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const filters = buildFilters(searchParams);

    const farmers = await Farmer.find(filters).sort({ fullName: 1 });
    return NextResponse.json({ data: farmers.map(serializeFarmer) });
  } catch (error) {
    console.error("GET /api/farmers", error);
    return NextResponse.json(
      { message: "Erro ao listar agricultores" },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const payload = await request.json();
    const parsed = createFarmerSchema.parse(payload);

    const normalizedCPF = assertValidCPF(parsed.cpf);

    await connectMongo();

    const existing = await Farmer.findOne({ cpf: normalizedCPF });
    if (existing) {
      return NextResponse.json(
        { message: "CPF já cadastrado" },
        { status: 409 }
      );
    }

    const farmer = await Farmer.create({
      fullName: parsed.fullName.trim(),
      cpf: normalizedCPF,
      birthDate: parsed.birthDate ? new Date(parsed.birthDate) : undefined,
      phone: parsed.phone?.trim(),
      active: parsed.active ?? true,
    });

    return NextResponse.json(
      { data: serializeFarmer(farmer) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    console.error("POST /api/farmers", error);
    return NextResponse.json(
      { message: "Erro ao criar agricultor" },
      { status: 500 }
    );
  }
};
