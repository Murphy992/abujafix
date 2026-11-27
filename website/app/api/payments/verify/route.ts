
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in to verify your payment." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const reference =
      typeof body.reference === "string" ? body.reference.trim() : "";

    if (!reference) {
      return NextResponse.json(
        { error: "A payment reference is required." },
        { status: 400 }
      );
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("id, amount, currency, reference, status")
      .eq("reference", reference)
      .eq("customer_id", user.id)
      .maybeSingle();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment record not found." },
        { status: 404 }
      );
    }

    if (payment.status === "success") {
      return NextResponse.json({
        message: "Payment has already been verified.",
        status: "success",
        reference,
      });
    }

    if (payment.status !== "pending") {
      return NextResponse.json(
        { error: "This payment is not pending." },
        { status: 409 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Payment verification is not configured." },
        { status: 500 }
      );
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const result = await paystackResponse.json();

    if (!paystackResponse.ok || !result.status || !result.data) {
      return NextResponse.json(
        { error: "Unable to verify this payment with Paystack." },
        { status: 502 }
      );
    }

    const transaction = result.data;
    const expectedAmount = Math.round(Number(payment.amount) * 100);

    const paymentIsValid =
      transaction.status === "success" &&
      transaction.reference === payment.reference &&
      transaction.currency === payment.currency &&
      Number(transaction.amount) === expectedAmount;

    if (!paymentIsValid) {
      return NextResponse.json(
        {
          error: "Paystack has not confirmed a matching successful payment.",
          status: transaction.status,
        },
        { status: 400 }
      );
    }

    const { data: confirmation, error: confirmationError } =
      await supabaseAdmin.rpc("confirm_abujafix_payment", {
        p_reference: reference,
        p_amount_kobo: Number(transaction.amount),
        p_currency: transaction.currency,
        p_paid_at: transaction.paid_at || new Date().toISOString(),
      });

    if (confirmationError || !confirmation?.success) {
      console.error("Atomic payment confirmation error:", confirmationError);

      return NextResponse.json(
        { error: "Payment was verified, but recording it failed. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Payment successfully verified.",
      status: "success",
      reference,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "An unexpected verification error occurred." },
      { status: 500 }
    );
  }
}
