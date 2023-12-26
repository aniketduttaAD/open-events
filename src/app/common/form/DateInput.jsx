import React from "react";
import { useField, useFormikContext } from "formik";
import { FormField, Label } from "semantic-ui-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateInput({ label, ...props }) {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(props);
  return (
    <FormField error={meta.touched && !!meta.error}>
      <label>{label}</label>
      <DatePicker
        {...field}
        {...props}
        style={{
          fontWeight: "400",
          fontFamily: "sans-serif",
        }}
        value={new Date(field.value)}
        selected={(field.value && new Date(field.value)) || null}
        onChange={(value) => setFieldValue(field.name, value.toJSON())}
      />
      {meta.touched && meta.error ? (
        <Label basic pointing color='red'>
          {meta.error}
        </Label>
      ) : null}
    </FormField>
  );
}
