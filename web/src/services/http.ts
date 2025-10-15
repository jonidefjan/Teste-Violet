export class HttpError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "HttpError";
  }
}

export const extractErrorMessage = async (response: Response) => {
  try {
    const body = await response.json();
    if (body && typeof body.message === "string") {
      return body.message;
    }
  } catch (error) {
    console.error("Falha ao ler resposta de erro", error);
  }

  return "Operação falhou";
};

export const ensureSuccess = async (response: Response) => {
  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new HttpError(message, response.status);
  }

  return response;
};
