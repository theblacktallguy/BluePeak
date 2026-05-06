import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const fromAccountId = String(body.fromAccountId ?? "");
    const recipientName = String(body.recipientName ?? "").trim();
    const recipientBank = String(body.recipientBank ?? "").trim();
    const recipientAccount = String(body.recipientAccount ?? "").trim();
    const amount = Number(body.amount ?? 0);
    const note = String(body.note ?? "").trim();
    const accessCode = String(body.accessCode ?? "").trim();

    if (
      !fromAccountId ||
      !recipientName ||
      !recipientBank ||
      !recipientAccount ||
      amount <= 0 ||
      !accessCode
    ) {
      return NextResponse.json(
        { message: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.isActive || user.isFrozen) {
      return NextResponse.json(
        { message: "Account is not allowed to make transfers." },
        { status: 403 }
      );
    }

    if (user.accessCode !== accessCode) {
      return NextResponse.json(
        { message: "Invalid access code." },
        { status: 400 }
      );
    }

    const account = await prisma.bankAccount.findFirst({
      where: {
        id: fromAccountId,
        userId: user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { message: "Source account not found." },
        { status: 404 }
      );
    }

    if (account.accountType === "CREDIT") {
      return NextResponse.json(
        { message: "Transfers cannot be sent from credit accounts." },
        { status: 400 }
      );
    }

    if (Number(account.balance) < amount) {
      return NextResponse.json(
        { message: "Insufficient balance." },
        { status: 400 }
      );
    }

    const transfer = await prisma.transferRequest.create({
      data: {
        userId: user.id,
        fromAccountId,
        recipientName,
        recipientBank,
        recipientAccount,
        amount: amount.toFixed(2),
        note: note || null,
        accessCodeUsed: true,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Transfer request submitted successfully.",
        transferId: transfer.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("TRANSFER_CREATE_ERROR", error);

    return NextResponse.json(
      { message: "Something went wrong while submitting transfer." },
      { status: 500 }
    );
  }
}