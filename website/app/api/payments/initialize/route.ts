
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export async function POST(request: NextRequest) {
  let reference = "";

  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in before making a payment." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const jobId =
      typeof body.jobId === "string" ? body.jobId.trim() : "";

    if (!jobId) {
      return NextResponse.json(
        { error: "A valid job ID is required." },
        { status: 400 }
      );
    }

    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, customer_id, quoted_amount, quote_accepted_at, payment_status")
      .eq("id", jobId)
      .eq("customer_id", user.id)
      .maybeSingle();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job not found or access denied." },
        { status: 404 }
      );
    }

    if (!job.quote_accepted_at) {
      return NextResponse.json(
        { error: "Please accept the technician's quote before paying." },
        { status: 400 }
      );
    }

    const amountInNaira = Number(job.quoted_amount);

    if (!Number.isFinite(amountInNaira) || amountInNaira <= 0) {
      return NextResponse.json(
        { error: "The technician's quote is invalid." },
        { status: 400 }
      );
    }

    if (job.payment_status === "paid") {
      return NextResponse.json(
        { error: "This job has already been paid." },
        { status: 409 }
      );
    }

    if (job.payment_status === "pending") {
      return NextResponse.json(
        { error: "A payment is already pending for this job." },
        { status: 409 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey || !user.email) {
      return NextResponse.json(
        { error: "Payment configuration or customer email is missing." },
        { status: 500 }
      );
    }

    reference = `AF-${randomUUID()}`;

    const { data: reservation, error: reservationError } =
      await supabaseAdmin.rpc("start_abujafix_payment", {
        p_job_id: job.id,
        p_customer_id: user.id,
        p_reference: reference,
      });

    if (reservationError || !reservation?.success) {
      console.error("Payment reservation error:", reservationError);

      return NextResponse.json(
        { error: "Could not reserve this payment. Please check the job payment status and try again." },
        { status: 409 }
      );
    }

    const reservedAmount = Number(reservation.amount);

    if (
      !Number.isFinite(reservedAmount) ||
      reservedAmount <= 0 ||
      Math.round(reservedAmount * 100) !== Math.round(amountInNaira * 100)
    ) {
      console.error("Reserved payment amount did not match the job quote.");

      await supabaseAdmin
        .from("payments")
        .update({ status: "failed" })
        .eq("reference", reference)
        .eq("status", "pending");

      await supabaseAdmin
        .from("jobs")
        .update({
          payment_status: "failed",
          payment_reference: null,
        })
        .eq("id", job.id)
        .eq("customer_id", user.id)
        .eq("payment_reference", reference);

      return NextResponse.json(
        { error: "The payment amount changed. Please refresh and try again." },
        { status: 409 }
      );
    }

    const amountInKobo = Math.round(reservedAmount * 100);

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: amountInKobo,
          currency: "NGN",
          reference,
          callback_url: `${request.nextUrl.origin}/customer-dashboard`,
          metadata: {
            job_id: job.id,
            customer_id: user.id,
            platform: "AbujaFix",
          },
        }),
      }
    );

    const result = await paystackResponse.json();

    if (!paystackResponse.ok || !result.status || !result.data?.authorization_url) {
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed" })
        .eq("reference", reference)
        .eq("status", "pending");

      await supabaseAdmin
        .from("jobs")
        .update({
          payment_status: "failed",
          payment_reference: null,
        })
        .eq("id", job.id)
        .eq("customer_id", user.id)
        .eq("payment_reference", reference);

      console.error("Paystack initialization error:", result);

      return NextResponse.json(
        { error: "Paystack could not initialize this payment. You can try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);

    if (reference) {
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed" })
        .eq("reference", reference)
        .eq("status", "pending");

      await supabaseAdmin
        .from("jobs")
        .update({
          payment_status: "failed",
          payment_reference: null,
        })
        .eq("payment_reference", reference)
        .eq("payment_status", "pending");
    }

    return NextResponse.json(
      { error: "An unexpected payment error occurred." },
      { status: 500 }
    );
  }
}
