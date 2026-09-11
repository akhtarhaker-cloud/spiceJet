import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enquirySchema } from "@/lib/validations";
import { assertSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);

  if (!parsed.success) {
    console.error("VALIDATION ERROR:", parsed.error.errors);
    console.error("RECEIVED BODY:", body);
    return NextResponse.json(
      { error: "Please check the required enquiry fields.", details: parsed.error.errors },
      { status: 400 }
    );
  }

  try {
    const input = parsed.data;
    const { supabaseUrl, supabasePublishableKey } = assertSupabaseConfigured();

    // Save enquiry to Supabase
    const supabase = createClient(supabaseUrl, supabasePublishableKey);
    const { error: dbError } = await supabase.from("enquiries").insert({
      enquiry_type: input.enquiryType,
      name: input.name,
      company_name: input.companyName || null,
      email: input.email,
      phone: input.phone,
      country: input.country,
      product_name: input.productName,
      required_quantity: input.requiredQuantity,
      packaging_requirement: input.packagingRequirement || null,
      message: input.message || null,
    });

    if (dbError) {
      console.error("DATABASE ERROR:", dbError);
      throw new Error("Failed to save enquiry to database.");
    }

    // Send email notification (optional)
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.ENQUIRY_TO_EMAIL;

    if (apiKey && toEmail) {
      const emailText = `
New Samiraq Global Enquiry

Name: ${input.name}
Company: ${input.companyName || "-"}
Email: ${input.email}
Phone: ${input.phone}
Country: ${input.country}
Product: ${input.productName}
Required Quantity: ${input.requiredQuantity}
Packaging Requirement: ${input.packagingRequirement || "-"}
Message: ${input.message || "-"}
      `.trim();

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Samiraq Global <onboarding@resend.dev>",
            to: [toEmail],
            reply_to: input.email,
            subject: `New Enquiry: ${input.enquiryType || "General"} - ${input.name}`,
            text: emailText,
          }),
        });
      } catch (emailError) {
        console.warn("Email notification failed, but enquiry was saved:", emailError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ENQUIRY ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Enquiry could not be processed. Please contact us by WhatsApp.",
      },
      { status: 503 }
    );
  }
}
