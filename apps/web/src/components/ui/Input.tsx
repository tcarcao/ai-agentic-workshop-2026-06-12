import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

// Ember floating-label input — uses .field + .field input + .field label from ember.css
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id: propId, placeholder, className = "", ...rest },
  ref,
) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  return (
    <div className={`field${className ? " " + className : ""}`}>
      {/* placeholder=" " (a single space) is required for the CSS floating-label
            :not(:placeholder-shown) trick. We preserve the caller's placeholder as
            the label text, but the actual input always gets " ". */}
      <input ref={ref} id={id} placeholder=" " {...rest} />
      <label htmlFor={id}>{label ?? placeholder ?? "Enter value"}</label>
    </div>
  );
});
