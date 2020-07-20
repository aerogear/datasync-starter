import React from "react";
import { AutoForm, AutoFields, ErrorsField, SubmitField } from "uniforms-ionic";
import { taskEditSchema, taskViewSchema } from "./task";

export function TaskForm(props: { model: any, handleSubmit: any }) {
  // Workaround for missing types for submit
  const Submit = SubmitField as any;
  return (
    <AutoForm schema={taskEditSchema} onSubmit={props.handleSubmit} model={props.model}>
      <AutoFields />
      <ErrorsField />
      <Submit />
    </AutoForm>
  );
}

export function TaskView(props: { model: any }) {
  return (
    <AutoForm schema={taskViewSchema} model={props.model}>
      <AutoFields />
      <ErrorsField />
    </AutoForm>
  );
}
