"use client";
import { FormEvent, useState } from "react";
import { products as defaultProducts, quantityOptions as defaultQuantityOptions, countries, whatsappUrl } from "@/lib/site";
type FormValues = Record<"name" | "company" | "email" | "phone" | "country" | "product" | "quantity" | "packaging" | "message", string>;
const initial: FormValues = { name: "", company: "", email: "", phone: "", country: "", product: "", quantity: "", packaging: "", message: "" };
type ProductOption = { name: string };
type FieldError = { field: string; message: string };

// Validation functions
function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
}

function validatePhone(phone: string): string | null {
  if (!phone) return "Phone is required";
  if (phone.length < 6) return "Phone must be at least 6 characters";
  if (!/[\d\s\-\+\(\)]+/.test(phone)) return "Phone should contain only numbers and common phone characters";
  return null;
}

function validateCountry(country: string): string | null {
  if (!country) return "Country is required";
  if (country.length < 2) return "Please select a country from the list";
  return null;
}

function validateForm(values: FormValues): FieldError[] {
  const errors: FieldError[] = [];
  if (!values.name?.trim()) errors.push({ field: "name", message: "Name is required" });
  else if (values.name.length < 2) errors.push({ field: "name", message: "Name must be at least 2 characters" });
  const emailError = validateEmail(values.email);
  if (emailError) errors.push({ field: "email", message: emailError });
  const phoneError = validatePhone(values.phone);
  if (phoneError) errors.push({ field: "phone", message: phoneError });
  const countryError = validateCountry(values.country);
  if (countryError) errors.push({ field: "country", message: countryError });
  if (!values.product) errors.push({ field: "product", message: "Please select a product" });
  if (!values.quantity) errors.push({ field: "quantity", message: "Please select a quantity" });
  return errors;
}

export function InquiryForm({ exportMode = false, products = defaultProducts, quantityOptions = defaultQuantityOptions, whatsappNumber }: { exportMode?: boolean; products?: readonly ProductOption[]; quantityOptions?: readonly string[]; whatsappNumber?: string }) {
  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  function getFieldError(field: string): string | undefined {
    return fieldErrors[field];
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateForm(values);
    if (validationErrors.length > 0) {
      const fieldErrorMap: Record<string, string> = {};
      const errorMessages: FieldError[] = [];
      validationErrors.forEach((err) => {
        fieldErrorMap[err.field] = err.message;
        errorMessages.push(err);
      });
      setFieldErrors(fieldErrorMap);
      setErrors(errorMessages);
      return;
    }
    setSending(true);
    setErrors([]);
    setFieldErrors({});
    const response = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enquiryType: exportMode ? "export" : "contact",
        name: values.name,
        companyName: values.company,
        email: values.email,
        phone: values.phone,
        country: values.country,
        productName: values.product,
        requiredQuantity: values.quantity,
        packagingRequirement: values.packaging,
        message: values.message,
      }),
    }).catch(() => null);
    setSending(false);
    if (!response?.ok) {
      const result = response ? await response.json() : null;
      setErrors([{ field: "form", message: result?.error || "We could not submit your enquiry. Please use WhatsApp." }]);
      return;
    }
    setSubmitted(true);
  }

  const message = `Hello SAMIRAQ GLOBAL, I am ${values.name || "interested in your products"}${values.company ? ` from ${values.company}` : ""}. I would like a quotation for ${values.product || "spices"}, quantity: ${values.quantity || "to be discussed"}. Country: ${values.country || "not specified"}. ${values.message}`;

  return (
    <form className="inquiry-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <Field label="Name" required value={values.name} onChange={(name) => setValues({ ...values, name })} error={getFieldError("name")} />
        <Field label="Company Name" value={values.company} onChange={(company) => setValues({ ...values, company })} />
        <Field label="Email" type="email" required value={values.email} onChange={(email) => setValues({ ...values, email })} error={getFieldError("email")} onBlur={() => { const err = validateEmail(values.email); setFieldErrors((prev) => ({ ...prev, email: err || "" })); }} />
        <Field label="Phone / WhatsApp" type="tel" required value={values.phone} onChange={(phone) => setValues({ ...values, phone })} error={getFieldError("phone")} onBlur={() => { const err = validatePhone(values.phone); setFieldErrors((prev) => ({ ...prev, phone: err || "" })); }} />
        <label>
          {exportMode ? "Destination Country" : "Country"} <span>*</span>
          <select value={values.country} onChange={(e) => { setValues({ ...values, country: e.target.value }); if (e.target.value) setFieldErrors((prev) => ({ ...prev, country: "" })); }} className={getFieldError("country") ? "input-error" : ""}>
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          {getFieldError("country") && <span className="field-error">{getFieldError("country")}</span>}
        </label>
        <label>
          Product <span>*</span>
          <select value={values.product} onChange={(e) => { setValues({ ...values, product: e.target.value }); if (e.target.value) setFieldErrors((prev) => ({ ...prev, product: "" })); }} className={getFieldError("product") ? "input-error" : ""}>
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.name} value={product.name}>{product.name}</option>
            ))}
          </select>
          {getFieldError("product") && <span className="field-error">{getFieldError("product")}</span>}
        </label>
        <label>
          Required Quantity <span>*</span>
          <select value={values.quantity} onChange={(e) => { setValues({ ...values, quantity: e.target.value }); if (e.target.value) setFieldErrors((prev) => ({ ...prev, quantity: "" })); }} className={getFieldError("quantity") ? "input-error" : ""}>
            <option value="">Select quantity</option>
            {quantityOptions.map((quantity) => (
              <option key={quantity} value={quantity}>{quantity}</option>
            ))}
          </select>
          {getFieldError("quantity") && <span className="field-error">{getFieldError("quantity")}</span>}
        </label>
        {exportMode && <Field label="Packaging / Private-label Requirement" value={values.packaging} onChange={(packaging) => setValues({ ...values, packaging })} />}
      </div>
      <label>
        Message (max 150 characters)
        <textarea rows={4} value={values.message} onChange={(e) => { const newValue = e.target.value.slice(0, 150); setValues({ ...values, message: newValue }); }} placeholder="Tell us about your requirement" maxLength={150} />
        <span className="char-count">{values.message.length}/150</span>
      </label>
      {errors.map((error) => (
        <p className="form-error" key={error.field}>{error.message}</p>
      ))}
      {submitted && (
        <div className="form-success">
          <strong>Your enquiry has been received.</strong>
          <br />
          Our team will review it. You may also send the prepared details via WhatsApp.
        </div>
      )}
      <div className="form-actions">
        <button className="button" type="submit" disabled={sending}>{sending ? "Sending…" : "Send Enquiry"}</button>
        {submitted && (
          <a href={whatsappUrl(message, whatsappNumber)} target="_blank" rel="noopener noreferrer" className="button button-secondary">Send via WhatsApp</a>
        )}
      </div>
    </form>
  );
}

function Field({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  required = false,
  error,
  onBlur
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
  type?: string; 
  required?: boolean;
  error?: string;
  onBlur?: () => void;
}) {
  return (
    <label>
      {label} {required && <span>*</span>}
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={error ? "input-error" : ""}
        aria-invalid={!!error}
      />
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
