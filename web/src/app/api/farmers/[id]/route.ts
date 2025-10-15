import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { z, ZodError } from "zod";
import { ensureInactiveBeforeDelete } from "@/lib/farmer-rules";
import { connectMongo } from "@/lib/mongodb";
import { Farmer } from "@/models/farmer";

const updateFarmerSchema = z.object({
  fullName: z.string().min(3, "Informe o nome completo"),
  birthDate: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  active: z.boolean(),
});

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

export const GET = async (
  _request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: "Identificador inválido" },
        { status: 400 }
      );
    }

    await connectMongo();
    const farmer = await Farmer.findById(params.id);
    if (!farmer) {
      return NextResponse.json(
        { message: "Agricultor não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: serializeFarmer(farmer) });
  } catch (error) {
    console.error(`GET /api/farmers/${params.id}`, error);
    return NextResponse.json(
      { message: "Erro ao carregar agricultor" },
      { status: 500 }
    );
  }
};

export const PUT = async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: "Identificador inválido" },
        { status: 400 }
      );
    }

    const payload = await request.json();
    const parsed = updateFarmerSchema.parse(payload);

    await connectMongo();
    const farmer = await Farmer.findById(params.id);
    if (!farmer) {
      return NextResponse.json(
        { message: "Agricultor não encontrado" },
        { status: 404 }
      );
    }

    farmer.fullName = parsed.fullName.trim();
    farmer.birthDate = parsed.birthDate
      ? new Date(parsed.birthDate)
      : undefined;
    farmer.phone = parsed.phone?.trim() || undefined;
    farmer.active = parsed.active;

    await farmer.save();

    return NextResponse.json({ data: serializeFarmer(farmer) });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      );
    }

    console.error(`PUT /api/farmers/${params.id}`, error);
    return NextResponse.json(
      { message: "Erro ao atualizar agricultor" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  _request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: "Identificador inválido" },
        { status: 400 }
      );
    }

    await connectMongo();
    const farmer = await Farmer.findById(params.id);
    if (!farmer) {
      return NextResponse.json(
        { message: "Agricultor não encontrado" },
        { status: 404 }
      );
    }

    try {
      ensureInactiveBeforeDelete(farmer.active);
    } catch {
      return NextResponse.json(
        { message: "Desative o agricultor antes de remover" },
        { status: 409 }
      );
    }

    await farmer.deleteOne();

    return NextResponse.json(
      { message: "Agricultor removido" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`DELETE /api/farmers/${params.id}`, error);
    return NextResponse.json(
      { message: "Erro ao remover agricultor" },
      { status: 500 }
    );
  }
};
